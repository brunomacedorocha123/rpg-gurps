// defesa.js - SISTEMA COMPLETO E FUNCIONAL - VERSÃO FINAL
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
      nivelCarga: 'nenhuma',
      redutorCarga: 0,
      pesoAtual: 0,
      pesoMaximo: 100,
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
    this.ultimaCargaDetectada = null;
    this.atributosObservers = [];
    
    // Cache de valores para verificar mudanças
    this.cacheAtributos = { dx: 10, ht: 10 };
    this.cacheCarga = 'nenhuma';
  }
  
  iniciar() {
    if (this.iniciado) return;
    
    try {
      console.log('🚀 Iniciando Sistema de Defesas...');
      
      // Primeiro: carregar elementos
      this.carregarElementos();
      
      // Segundo: configurar observadores de atributos ANTES de carregar valores
      this.configurarObservadoresAtributos();
      
      // Terceiro: carregar valores iniciais
      this.carregarValoresIniciais();
      
      // Quarto: configurar eventos e monitoramento
      this.configurarEventos();
      this.iniciarMonitoramentoCarga();
      this.detectarNivelCargaInicial();
      
      // Quinto: calcular tudo
      this.calcularTudo();
      this.iniciarMonitoramento();
      
      this.iniciado = true;
      
      console.log('✅ Sistema de defesas iniciado com sucesso!');
      console.log('📊 Estado inicial:', {
        dx: this.estado.atributos.dx,
        ht: this.estado.atributos.ht,
        carga: this.estado.nivelCarga,
        redutor: this.estado.redutorCarga
      });
      
    } catch (error) {
      console.error('❌ Erro ao iniciar sistema de defesas:', error);
    }
  }
  
  carregarElementos() {
    console.log('🔍 Carregando elementos...');
    
    // Atributos (vêm do sistema de atributos)
    this.elementos.dx = document.getElementById('DX');
    this.elementos.ht = document.getElementById('HT');
    
    console.log('📌 Elemento DX encontrado:', !!this.elementos.dx);
    console.log('📌 Elemento HT encontrado:', !!this.elementos.ht);
    
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
    
    // Elementos para exibição de carga
    this.elementos.cargaContainer = document.querySelector('.defesas-card .card-body');
    this.elementos.esquivaInfo = document.querySelector('.defesa-item:nth-child(1) .defesa-info');
    
    // Inputs de modificadores
    ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
      this.elementos[`${defesa}Mod`] = document.getElementById(`${defesa}Mod`);
    });
  }
  
  // NOVO: Configurar observadores robustos para atributos
  configurarObservadoresAtributos() {
    console.log('👁️ Configurando observadores de atributos...');
    
    // Observar mudanças nos inputs de atributos
    ['DX', 'HT'].forEach(atributo => {
      const input = document.getElementById(atributo);
      if (input) {
        console.log(`✅ Observador configurado para ${atributo}`);
        
        // Evento input (em tempo real)
        input.addEventListener('input', (e) => {
          this.handleAtributoChange(atributo.toLowerCase(), e.target.value);
        });
        
        // Evento change (quando perde foco)
        input.addEventListener('change', (e) => {
          this.handleAtributoChange(atributo.toLowerCase(), e.target.value);
        });
        
        // Observador de MutationObserver para mudanças via código
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' || mutation.type === 'characterData') {
              const novoValor = input.value;
              if (novoValor !== this.cacheAtributos[atributo.toLowerCase()]) {
                this.handleAtributoChange(atributo.toLowerCase(), novoValor);
              }
            }
          });
        });
        
        observer.observe(input, {
          attributes: true,
          attributeFilter: ['value'],
          characterData: true,
          subtree: true
        });
        
        this.atributosObservers.push(observer);
      } else {
        console.warn(`⚠️ Input ${atributo} não encontrado para observador`);
      }
    });
  }
  
  // NOVO: Handler para mudanças de atributos
  handleAtributoChange(atributo, valor) {
    const valorNumerico = parseInt(valor) || 10;
    
    // Verificar se realmente mudou
    if (this.cacheAtributos[atributo] === valorNumerico) {
      return;
    }
    
    console.log(`🔄 Atributo ${atributo.toUpperCase()} alterado: ${this.cacheAtributos[atributo]} → ${valorNumerico}`);
    
    // Atualizar cache e estado
    this.cacheAtributos[atributo] = valorNumerico;
    this.estado.atributos[atributo] = valorNumerico;
    
    // Recalcular defesas
    this.calcularTudo();
    
    // Feedback visual
    this.mostrarFeedbackAtributo(atributo, valorNumerico);
  }
  
  carregarValoresIniciais() {
    console.log('📥 Carregando valores iniciais...');
    
    // Carrega DX e HT do sistema de atributos com fallback
    if (this.elementos.dx) {
      const dxValor = parseInt(this.elementos.dx.value);
      this.estado.atributos.dx = isNaN(dxValor) ? 10 : dxValor;
      this.cacheAtributos.dx = this.estado.atributos.dx;
      console.log(`🎯 DX inicial: ${this.estado.atributos.dx}`);
    }
    
    if (this.elementos.ht) {
      const htValor = parseInt(this.elementos.ht.value);
      this.estado.atributos.ht = isNaN(htValor) ? 10 : htValor;
      this.cacheAtributos.ht = this.estado.atributos.ht;
      console.log(`🎯 HT inicial: ${this.estado.atributos.ht}`);
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
    
    console.log('✅ Valores iniciais carregados');
  }
  
  detectarNivelCargaInicial() {
    try {
      console.log('📦 Detectando nível de carga inicial...');
      
      // Método 1: Buscar do sistema de equipamentos
      if (window.sistemaEquipamentos) {
        this.estado.nivelCarga = window.sistemaEquipamentos.nivelCargaAtual || 'nenhuma';
        this.estado.pesoAtual = window.sistemaEquipamentos.pesoAtual || 0;
        this.estado.pesoMaximo = window.sistemaEquipamentos.pesoMaximo || 100;
        console.log(`🎯 Carga do sistema: ${this.estado.nivelCarga}`);
      }
      
      // Método 2: Buscar do elemento HTML
      const cargaElement = document.getElementById('nivelCarga');
      if (cargaElement && cargaElement.textContent) {
        const nivel = cargaElement.textContent.toLowerCase().trim();
        if (nivel && nivel !== 'undefined') {
          this.estado.nivelCarga = nivel;
          console.log(`🎯 Carga do elemento: ${nivel}`);
        }
      }
      
      // Método 3: Buscar do localStorage
      try {
        const cargaSalva = localStorage.getItem('gurps_nivel_carga');
        if (cargaSalva) {
          const dados = JSON.parse(cargaSalva);
          if (dados.nivel) {
            this.estado.nivelCarga = dados.nivel;
            this.estado.pesoAtual = dados.pesoAtual || 0;
            this.estado.pesoMaximo = dados.pesoMaximo || 100;
            console.log(`🎯 Carga do localStorage: ${dados.nivel}`);
          }
        }
      } catch (e) {
        // Silencioso
      }
      
      // Garantir valor padrão
      if (!this.estado.nivelCarga || this.estado.nivelCarga === 'undefined') {
        this.estado.nivelCarga = 'nenhuma';
      }
      
      // Calcular redutor baseado no nível
      this.estado.redutorCarga = this.getRedutorCarga(this.estado.nivelCarga);
      this.cacheCarga = this.estado.nivelCarga;
      
      console.log(`✅ Nível de carga: ${this.estado.nivelCarga}, Redutor: ${this.estado.redutorCarga}`);
      
    } catch (error) {
      console.warn('⚠️ Não foi possível detectar nível de carga:', error);
      this.estado.nivelCarga = 'nenhuma';
      this.estado.redutorCarga = 0;
      this.cacheCarga = 'nenhuma';
    }
  }
  
  iniciarMonitoramentoCarga() {
    console.log('👁️ Iniciando monitoramento de carga...');
    
    // Método 1: Observar eventos do sistema de equipamentos
    document.addEventListener('equipamentosAtualizados', (e) => {
      if (e.detail && e.detail.nivelCargaAtual) {
        console.log('📦 Evento de carga recebido:', e.detail.nivelCargaAtual);
        this.atualizarNivelCarga(e.detail.nivelCargaAtual, e.detail.pesoAtual, e.detail.pesoMaximo);
      }
    });
    
    // Método 2: Observar elemento HTML de carga
    this.iniciarObservadorElementoCarga();
    
    // Método 3: Polling periódico (fallback)
    this.iniciarPollingCarga();
  }
  
  iniciarObservadorElementoCarga() {
    const cargaElement = document.getElementById('nivelCarga');
    if (!cargaElement) {
      console.log('⏳ Elemento de carga não encontrado, tentando novamente em 1s...');
      setTimeout(() => this.iniciarObservadorElementoCarga(), 1000);
      return;
    }
    
    console.log('✅ Observador configurado para elemento de carga');
    
    const observer = new MutationObserver(() => {
      const novoNivel = cargaElement.textContent.toLowerCase().trim();
      if (novoNivel && novoNivel !== this.ultimaCargaDetectada && novoNivel !== 'undefined') {
        console.log(`🔄 Carga detectada via elemento: ${novoNivel}`);
        this.ultimaCargaDetectada = novoNivel;
        this.atualizarNivelCarga(novoNivel);
      }
    });
    
    observer.observe(cargaElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
    
    this.observadores.push(observer);
  }
  
  iniciarPollingCarga() {
    console.log('⏰ Polling de carga iniciado (2s)');
    
    setInterval(() => {
      if (this.atualizando) return;
      
      // Buscar do sistema de equipamentos
      if (window.sistemaEquipamentos && 
          window.sistemaEquipamentos.nivelCargaAtual &&
          window.sistemaEquipamentos.nivelCargaAtual !== this.cacheCarga) {
        
        console.log(`🔄 Carga detectada via polling: ${window.sistemaEquipamentos.nivelCargaAtual}`);
        
        this.atualizarNivelCarga(
          window.sistemaEquipamentos.nivelCargaAtual,
          window.sistemaEquipamentos.pesoAtual,
          window.sistemaEquipamentos.pesoMaximo
        );
      }
    }, 2000);
  }
  
  atualizarNivelCarga(novoNivel, pesoAtual = null, pesoMaximo = null) {
    const nivelFormatado = novoNivel.toLowerCase().trim();
    
    // Validar nível
    if (!nivelFormatado || nivelFormatado === 'undefined') {
      console.warn('⚠️ Nível de carga inválido:', novoNivel);
      return;
    }
    
    // Se não mudou, não faz nada
    if (nivelFormatado === this.cacheCarga) {
      return;
    }
    
    console.log(`📦 Atualizando carga: ${this.cacheCarga} → ${nivelFormatado}`);
    
    const redutorAntigo = this.estado.redutorCarga;
    this.estado.nivelCarga = nivelFormatado;
    this.estado.redutorCarga = this.getRedutorCarga(nivelFormatado);
    this.cacheCarga = nivelFormatado;
    
    if (pesoAtual !== null) this.estado.pesoAtual = pesoAtual;
    if (pesoMaximo !== null) this.estado.pesoMaximo = pesoMaximo;
    
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
    
    // Recalcular defesas afetadas pela carga
    this.calcularEsquiva();
    this.calcularDeslocamento();
    this.atualizarInterface();
    
    // Mostrar feedback
    if (redutorAntigo !== this.estado.redutorCarga) {
      this.mostrarFeedbackCarga(nivelFormatado);
    }
  }
  
  getRedutorCarga(nivelCarga) {
    const nivel = nivelCarga.toLowerCase().trim();
    
    const redutores = {
      'nenhuma': 0,
      'leve': -1,
      'média': -2,
      'media': -2,
      'pesada': -3,
      'muito pesada': -4,
      'muito-pesada': -4,
      'sobrecarregado': -4
    };
    
    return redutores[nivel] || 0;
  }
  
  // CORRIGIDO: Matemática do deslocamento (apenas -1 por nível)
  calcularDeslocamento() {
    const { dx, ht } = this.estado.atributos;
    
    // Fórmula: (DX + HT) / 4
    const base = (dx + ht) / 4;
    const modificador = this.estado.modificadores.deslocamento;
    
    // REDUTOR SIMPLES: -1 por nível de carga (igual esquiva)
    const redutor = this.estado.redutorCarga;
    
    let total = base + modificador + redutor; // Apenas soma o redutor
    
    // Aplica penalidade de fadiga
    total = this.aplicarPenalidadeFadiga(total, 'deslocamento');
    
    // Mínimo 0
    this.estado.defesas.deslocamento = Math.max(total, 0);
    
    console.log(`🏃 Deslocamento: ${base.toFixed(2)}[base] + ${modificador}[mod] + ${redutor}[carga] = ${this.estado.defesas.deslocamento.toFixed(2)}`);
  }
  
  calcularEsquiva() {
    const { dx, ht } = this.estado.atributos;
    
    // Fórmula: (DX + HT) / 4 + 3 (arredondado para baixo)
    const base = Math.floor((dx + ht) / 4) + 3;
    const modificador = this.estado.modificadores.esquiva;
    const bonusTotal = this.calcularBonusTotal();
    
    // Redutor de carga
    const totalBase = base + modificador + bonusTotal;
    let totalComCarga = totalBase + this.estado.redutorCarga;
    
    // Aplica penalidade de fadiga
    totalComCarga = this.aplicarPenalidadeFadiga(totalComCarga, 'esquiva');
    
    // Mínimo 1
    this.estado.defesas.esquiva = Math.max(totalComCarga, 1);
    
    console.log(`🎯 Esquiva: ${base}[base] + ${modificador}[mod] + ${bonusTotal}[bonus] + ${this.estado.redutorCarga}[carga] = ${this.estado.defesas.esquiva}`);
  }
  
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
  
  calcularTudo() {
    if (this.atualizando) return;
    
    this.atualizando = true;
    
    try {
      console.log('🧮 Calculando todas as defesas...');
      
      // Busca NH das perícias aprendidas
      this.buscarNHs();
      
      // Calcula cada defesa
      this.calcularEsquiva();
      this.calcularBloqueio();
      this.calcularAparar();
      this.calcularDeslocamento();
      
      // Atualiza interface
      this.atualizarInterface();
      
      console.log('✅ Cálculos concluídos:', this.estado.defesas);
      
    } catch (error) {
      console.error('❌ Erro nos cálculos:', error);
    } finally {
      this.atualizando = false;
    }
  }
  
  buscarNHs() {
    this.buscarNHEscudo();
    this.buscarNHArma();
  }
  
  buscarNHEscudo() {
    const dx = this.estado.atributos.dx;
    let nivelEscudo = 0;
    
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
    
    this.estado.nh.escudo = nivelEscudo > 0 ? dx + nivelEscudo : null;
  }
  
  buscarNHArma() {
    const dx = this.estado.atributos.dx;
    let nivelArma = 0;
    let nomeArma = '';
    
    const periciasArma = [
      'Adaga', 'Espada', 'Machado', 'Maça', 'Arco', 'Lança',
      'Martelo', 'Faca', 'Bastão', 'Rapieira', 'Sabre', 'Terçado'
    ];
    
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
    
    this.estado.nh.arma = nivelArma > 0 ? dx + nivelArma : null;
    this.estado.nomeArma = nomeArma;
  }
  
  calcularBonusTotal() {
    const { reflexos, escudo, capa, outros } = this.estado.bonus;
    return reflexos + escudo + capa + outros;
  }
  
  verificarFadiga() {
    try {
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
      // Silencioso
    }
  }
  
  aplicarPenalidadeFadiga(valor, tipoDefesa) {
    if (!this.estado.fadiga.ativa) {
      return valor;
    }
    
    if (tipoDefesa === 'esquiva' || tipoDefesa === 'deslocamento') {
      return Math.ceil(valor / 2);
    }
    
    return valor;
  }
  
  atualizarInterface() {
    this.atualizarValoresDefesa();
    this.atualizarTotalBonus();
    this.atualizarIndicadorCarga();
    this.corrigirValoresIncorretos();
  }
  
  atualizarValoresDefesa() {
    if (this.elementos.esquivaTotal) {
      this.elementos.esquivaTotal.textContent = this.estado.defesas.esquiva;
    }
    
    if (this.elementos.bloqueioTotal) {
      this.elementos.bloqueioTotal.textContent =
        this.estado.defesas.bloqueio > 0 ? this.estado.defesas.bloqueio : "—";
    }
    
    if (this.elementos.apararTotal) {
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
  
  atualizarIndicadorCarga() {
    let indicadorCarga = document.getElementById('indicadorCargaDefesa');
    
    if (!indicadorCarga && this.elementos.esquivaInfo) {
      indicadorCarga = document.createElement('div');
      indicadorCarga.id = 'indicadorCargaDefesa';
      indicadorCarga.className = 'indicador-carga';
      
      this.elementos.esquivaInfo.parentNode.insertBefore(
        indicadorCarga,
        this.elementos.esquivaInfo.nextElementSibling
      );
    }
    
    if (indicadorCarga) {
      const nivel = this.estado.nivelCarga;
      const redutor = this.estado.redutorCarga;
      
      if (nivel !== 'nenhuma' && redutor < 0) {
        const texto = this.getTextoIndicadorCarga(nivel, redutor);
        indicadorCarga.innerHTML = texto;
        indicadorCarga.style.display = 'block';
        indicadorCarga.className = `indicador-carga carga-${nivel.replace(' ', '-')}`;
      } else {
        indicadorCarga.style.display = 'none';
      }
    }
  }
  
  getTextoIndicadorCarga(nivel, redutor) {
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
      <div class="carga-info" title="Carga: ${this.estado.pesoAtual.toFixed(1)}kg / ${this.estado.pesoMaximo.toFixed(1)}kg">
        <span class="carga-icone">${icone}</span>
        <span class="carga-texto">${nivelFormatado} (${redutor} Esq/Des)</span>
      </div>
    `;
  }
  
  mostrarFeedbackCarga(novoNivel) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-carga';
    feedback.innerHTML = `
      <i class="fas fa-weight-hanging"></i>
      <span>Carga: ${novoNivel.toUpperCase()} (${this.estado.redutorCarga})</span>
    `;
    
    feedback.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 12px;
      border-radius: 5px;
      font-size: 12px;
      font-weight: bold;
      z-index: 1000;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s;
      border-left: 4px solid ${this.getCorCarga(novoNivel)};
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
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
      }, 1500);
    }
  }
  
  mostrarFeedbackAtributo(atributo, valor) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-atributo';
    feedback.innerHTML = `
      <i class="fas fa-sync-alt"></i>
      <span>${atributo.toUpperCase()}: ${valor}</span>
    `;
    
    feedback.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(41, 128, 185, 0.9);
      color: white;
      padding: 6px 12px;
      border-radius: 5px;
      font-size: 12px;
      font-weight: bold;
      z-index: 1000;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
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
      }, 1500);
    }
  }
  
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
  
  corrigirValoresIncorretos() {
    const bloqueioElement = document.getElementById('bloqueioTotal');
    if (bloqueioElement && bloqueioElement.textContent.trim() === '8') {
      if (this.estado.defesas.bloqueio !== 8) {
        bloqueioElement.textContent =
          this.estado.defesas.bloqueio > 0 ? this.estado.defesas.bloqueio : "—";
      }
    }
    
    const apararElement = document.getElementById('apararTotal');
    if (apararElement && this.estado.defesas.aparar === 0) {
      apararElement.textContent = "—";
    }
  }
  
  configurarEventos() {
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
    
    ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
      const input = document.getElementById(`${defesa}Mod`);
      if (input) {
        input.addEventListener('change', () => {
          this.estado.modificadores[defesa] = parseInt(input.value) || 0;
          this.calcularTudo();
        });
      }
    });
    
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
  
  iniciarMonitoramento() {
    this.monitorarFadiga();
    this.iniciarAtualizacaoPeriodica();
  }
  
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
  
  iniciarAtualizacaoPeriodica() {
    setInterval(() => {
      if (!this.atualizando) {
        this.calcularTudo();
      }
    }, 2000);
  }
  
  forcarRecalculo() {
    this.estado.nh.escudo = null;
    this.estado.nh.arma = null;
    this.carregarValoresIniciais();
    this.calcularTudo();
  }
  
  mostrarStatus() {
    console.log('=== STATUS DEFESAS ===');
    console.log('Atributos:', this.estado.atributos);
    console.log('Defesas:', this.estado.defesas);
    console.log('Carga:', this.estado.nivelCarga, `(${this.estado.redutorCarga})`);
    console.log('Peso:', `${this.estado.pesoAtual}kg / ${this.estado.pesoMaximo}kg`);
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
  }, 100);
  
  return sistemaDefesasGlobal;
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM carregado, configurando sistema de defesas...');
  
  const combateTab = document.getElementById('combate');
  
  function verificarEIniciar() {
    console.log('🔍 Verificando aba combate...');
    if (combateTab && combateTab.classList.contains('active')) {
      console.log('🎯 Aba combate ativa, iniciando sistema...');
      iniciarSistemaDefesas();
    }
  }
  
  verificarEIniciar();
  
  if (combateTab) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
          console.log('🔄 Classe da aba combate alterada');
          setTimeout(verificarEIniciar, 100);
        }
      });
    });
    
    observer.observe(combateTab, { attributes: true });
  }
  
  // Também iniciar quando a aba for clicada
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.getAttribute('onclick')?.includes('openTab') && this.textContent.includes('Combate')) {
        setTimeout(() => {
          if (!sistemaDefesasGlobal || !sistemaDefesasGlobal.iniciado) {
            console.log('🎯 Aba Combate clicada, iniciando sistema...');
            iniciarSistemaDefesas();
          }
        }, 300);
      }
    });
  });
});

// Funções globais
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
  atualizarCarga: (nivel) => {
    if (sistemaDefesasGlobal) {
      sistemaDefesasGlobal.atualizarNivelCarga(nivel);
    }
  },
  testar: () => {
    if (sistemaDefesasGlobal) {
      console.log('🧪 Testando sistema...');
      sistemaDefesasGlobal.estado.atributos.dx = 12;
      sistemaDefesasGlobal.estado.atributos.ht = 12;
      sistemaDefesasGlobal.calcularTudo();
    }
  }
};

// Atalhos de console
window.DS = () => defesa.status();
window.DR = () => defesa.recalcular();
window.DC = (nivel) => defesa.atualizarCarga(nivel);
window.DT = () => defesa.testar();

console.log('✅ Sistema de Defesas carregado!');
console.log('🎮 Comandos: DS() - Status, DR() - Recalcular, DC("leve") - Testar carga, DT() - Teste rápido');