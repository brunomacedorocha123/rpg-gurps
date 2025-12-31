// defesa.js - SISTEMA COMPLETO E FUNCIONAL - VERSÃO FINAL
// Usa o mesmo padrão de tecnicas.js para atualização automática

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
    this.ultimoUpdate = 0;
    
    // Cache para evitar cálculos desnecessários
    this.cache = {
      dx: 10,
      ht: 10,
      carga: 'nenhuma',
      bonusReflexos: 0,
      bonusEscudo: 0,
      bonusCapa: 0,
      bonusOutros: 0
    };
    
    console.log('🛡️ SistemaDefesas instanciado');
  }
  
  // MÉTODO PRINCIPAL DE INICIALIZAÇÃO
  iniciar() {
    if (this.iniciado) {
      console.log('⚠️ Sistema já iniciado, recalculando...');
      this.calcularTudo();
      return;
    }
    
    try {
      console.log('🚀 Iniciando Sistema de Defesas...');
      
      // 1. Carregar elementos da aba Combate
      this.carregarElementosCombate();
      
      // 2. Carregar valores iniciais (usando localStorage)
      this.carregarValoresIniciais();
      
      // 3. Configurar eventos da aba Combate
      this.configurarEventosCombate();
      
      // 4. Iniciar monitoramento automático
      this.iniciarMonitoramento();
      
      // 5. Calcular valores iniciais
      this.calcularTudo();
      
      this.iniciado = true;
      
      console.log('✅ Sistema de defesas iniciado com sucesso!');
      console.log('📊 Estado inicial:', {
        DX: this.estado.atributos.dx,
        HT: this.estado.atributos.ht,
        Esquiva: this.estado.defesas.esquiva,
        Deslocamento: this.estado.defesas.deslocamento,
        Carga: this.estado.nivelCarga,
        Redutor: this.estado.redutorCarga
      });
      
    } catch (error) {
      console.error('❌ Erro ao iniciar sistema:', error);
    }
  }
  
  // MÉTODO IMPORTANTE: Carrega elementos APENAS da aba Combate
  carregarElementosCombate() {
    console.log('🔍 Carregando elementos da aba Combate...');
    
    // Apenas elementos que existem na aba Combate
    this.elementos.bonusReflexos = document.getElementById('bonusReflexos');
    this.elementos.bonusEscudo = document.getElementById('bonusEscudo');
    this.elementos.bonusCapa = document.getElementById('bonusCapa');
    this.elementos.bonusOutros = document.getElementById('bonusOutros');
    
    this.elementos.esquivaTotal = document.getElementById('esquivaTotal');
    this.elementos.bloqueioTotal = document.getElementById('bloqueioTotal');
    this.elementos.apararTotal = document.getElementById('apararTotal');
    this.elementos.deslocamentoTotal = document.getElementById('deslocamentoTotal');
    
    this.elementos.totalBonus = document.getElementById('totalBonus');
    
    // Elementos para indicador de carga
    this.elementos.esquivaInfo = document.querySelector('.defesa-item:nth-child(1) .defesa-info');
    
    // Inputs de modificadores
    ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
      this.elementos[`${defesa}Mod`] = document.getElementById(`${defesa}Mod`);
    });
    
    console.log('✅ Elementos da aba Combate carregados');
  }
  
  // MÉTODO IMPORTANTE: Carrega valores do localStorage (igual técnicas.js faz)
  carregarValoresIniciais() {
    console.log('📥 Carregando valores iniciais do localStorage...');
    
    // 1. Carregar DX e HT do localStorage (atualizado por atributos.js)
    this.carregarAtributosLocalStorage();
    
    // 2. Carregar bônus da aba Combate
    this.carregarBonusCombate();
    
    // 3. Carregar modificadores da aba Combate
    this.carregarModificadoresCombate();
    
    // 4. Carregar nível de carga
    this.carregarNivelCarga();
    
    console.log('✅ Valores iniciais carregados:', {
      dx: this.estado.atributos.dx,
      ht: this.estado.atributos.ht
    });
  }
  
  // MÉTODO NOVO: Carrega atributos do localStorage (padrão igual técnicas.js)
  carregarAtributosLocalStorage() {
    try {
      const dados = localStorage.getItem('gurps_atributos');
      if (dados) {
        const parsed = JSON.parse(dados);
        if (parsed.atributos) {
          // DX e HT do localStorage (atualizado por atributos.js)
          this.estado.atributos.dx = parsed.atributos.DX || 10;
          this.estado.atributos.ht = parsed.atributos.HT || 10;
          
          // Atualizar cache
          this.cache.dx = this.estado.atributos.dx;
          this.cache.ht = this.estado.atributos.ht;
          
          console.log(`🎯 Atributos do localStorage: DX=${this.estado.atributos.dx}, HT=${this.estado.atributos.ht}`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Não foi possível carregar atributos do localStorage:', error);
      this.estado.atributos.dx = 10;
      this.estado.atributos.ht = 10;
    }
  }
  
  carregarBonusCombate() {
    ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
      const input = document.getElementById(`bonus${bonus}`);
      if (input) {
        const valor = parseInt(input.value) || 0;
        this.estado.bonus[bonus.toLowerCase()] = valor;
        this.cache[`bonus${bonus}`] = valor;
      }
    });
  }
  
  carregarModificadoresCombate() {
    ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
      const input = document.getElementById(`${defesa}Mod`);
      if (input) {
        this.estado.modificadores[defesa] = parseInt(input.value) || 0;
      }
    });
  }
  
  carregarNivelCarga() {
    try {
      // Método 1: Sistema de equipamentos
      if (window.sistemaEquipamentos && window.sistemaEquipamentos.nivelCargaAtual) {
        this.estado.nivelCarga = window.sistemaEquipamentos.nivelCargaAtual;
        this.estado.pesoAtual = window.sistemaEquipamentos.pesoAtual || 0;
        this.estado.pesoMaximo = window.sistemaEquipamentos.pesoMaximo || 100;
      }
      
      // Método 2: Elemento HTML
      const cargaElement = document.getElementById('nivelCarga');
      if (cargaElement && cargaElement.textContent) {
        const nivel = cargaElement.textContent.toLowerCase().trim();
        if (nivel && nivel !== 'undefined') {
          this.estado.nivelCarga = nivel;
        }
      }
      
      // Método 3: localStorage
      const cargaSalva = localStorage.getItem('gurps_nivel_carga');
      if (cargaSalva) {
        const dados = JSON.parse(cargaSalva);
        if (dados.nivel) {
          this.estado.nivelCarga = dados.nivel;
          this.estado.pesoAtual = dados.pesoAtual || 0;
          this.estado.pesoMaximo = dados.pesoMaximo || 100;
        }
      }
      
      // Valor padrão
      if (!this.estado.nivelCarga || this.estado.nivelCarga === 'undefined') {
        this.estado.nivelCarga = 'nenhuma';
      }
      
      // Calcular redutor
      this.estado.redutorCarga = this.getRedutorCarga(this.estado.nivelCarga);
      this.cache.carga = this.estado.nivelCarga;
      
      console.log(`📦 Carga: ${this.estado.nivelCarga}, Redutor: ${this.estado.redutorCarga}`);
      
    } catch (error) {
      console.warn('⚠️ Erro ao carregar nível de carga:', error);
      this.estado.nivelCarga = 'nenhuma';
      this.estado.redutorCarga = 0;
      this.cache.carga = 'nenhuma';
    }
  }
  
  // MÉTODO IMPORTANTE: Inicia monitoramento automático
  iniciarMonitoramento() {
    console.log('👁️ Iniciando monitoramento automático...');
    
    // 1. Observar localStorage (igual técnicas.js faz)
    this.iniciarObservadorLocalStorage();
    
    // 2. Observar eventos do sistema de equipamentos
    this.iniciarObservadorEquipamentos();
    
    // 3. Observar mudanças na própria aba Combate
    this.iniciarObservadorCombate();
    
    // 4. Polling leve como fallback
    this.iniciarPollingLeve();
    
    console.log('✅ Monitoramento configurado');
  }
  
  // MÉTODO NOVO: Observa mudanças no localStorage (padrão igual técnicas.js)
  iniciarObservadorLocalStorage() {
    // Evento disparado quando localStorage muda
    window.addEventListener('storage', (e) => {
      if (e.key === 'gurps_atributos') {
        console.log('🔄 localStorage "gurps_atributos" alterado!');
        this.atualizarAtributos();
        this.calcularTudo();
      }
      
      if (e.key === 'gurps_nivel_carga') {
        console.log('🔄 localStorage "gurps_nivel_carga" alterado!');
        this.carregarNivelCarga();
        this.calcularTudo();
      }
    });
  }
  
  // MÉTODO NOVO: Atualiza atributos quando localStorage muda
  atualizarAtributos() {
    const dxAnterior = this.estado.atributos.dx;
    const htAnterior = this.estado.atributos.ht;
    
    this.carregarAtributosLocalStorage();
    
    if (dxAnterior !== this.estado.atributos.dx || htAnterior !== this.estado.atributos.ht) {
      console.log(`🔄 Atributos atualizados: DX ${dxAnterior}→${this.estado.atributos.dx}, HT ${htAnterior}→${this.estado.atributos.ht}`);
      return true;
    }
    
    return false;
  }
  
  iniciarObservadorEquipamentos() {
    // Eventos do sistema de equipamentos
    document.addEventListener('equipamentosAtualizados', (e) => {
      if (e.detail && e.detail.nivelCargaAtual) {
        console.log('📦 Evento de carga:', e.detail.nivelCargaAtual);
        this.atualizarNivelCarga(e.detail.nivelCargaAtual);
      }
    });
  }
  
  iniciarObservadorCombate() {
    // Observar mudanças nos inputs da aba Combate
    ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
      const input = document.getElementById(`bonus${bonus}`);
      if (input) {
        input.addEventListener('change', () => {
          const valor = parseInt(input.value) || 0;
          if (this.cache[`bonus${bonus}`] !== valor) {
            this.cache[`bonus${bonus}`] = valor;
            this.estado.bonus[bonus.toLowerCase()] = valor;
            this.calcularTudo();
          }
        });
      }
    });
    
    // Observar modificadores
    ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
      const input = document.getElementById(`${defesa}Mod`);
      if (input) {
        input.addEventListener('change', () => {
          this.estado.modificadores[defesa] = parseInt(input.value) || 0;
          this.calcularTudo();
        });
      }
    });
  }
  
  // MÉTODO NOVO: Polling leve (verifica a cada 2 segundos)
  iniciarPollingLeve() {
    console.log('⏰ Polling leve iniciado (2s)');
    
    setInterval(() => {
      if (this.atualizando) return;
      
      // Verificar se atributos mudaram
      const mudou = this.atualizarAtributos();
      
      // Verificar se carga mudou
      if (window.sistemaEquipamentos && 
          window.sistemaEquipamentos.nivelCargaAtual &&
          window.sistemaEquipamentos.nivelCargaAtual !== this.cache.carga) {
        
        console.log(`🔄 Polling detectou carga: ${this.cache.carga} → ${window.sistemaEquipamentos.nivelCargaAtual}`);
        this.atualizarNivelCarga(window.sistemaEquipamentos.nivelCargaAtual);
        mudou = true;
      }
      
      // Se algo mudou, recalcular
      if (mudou) {
        this.calcularTudo();
      }
    }, 2000); // Apenas 2 segundos
  }
  
  atualizarNivelCarga(novoNivel, pesoAtual = null, pesoMaximo = null) {
    const nivelFormatado = novoNivel.toLowerCase().trim();
    
    if (!nivelFormatado || nivelFormatado === 'undefined') return;
    if (nivelFormatado === this.cache.carga) return;
    
    console.log(`📦 Atualizando carga: ${this.cache.carga} → ${nivelFormatado}`);
    
    const nivelAnterior = this.estado.nivelCarga;
    const redutorAnterior = this.estado.redutorCarga;
    
    this.estado.nivelCarga = nivelFormatado;
    this.estado.redutorCarga = this.getRedutorCarga(nivelFormatado);
    this.cache.carga = nivelFormatado;
    
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
    
    // Feedback visual se redutor mudou
    if (redutorAnterior !== this.estado.redutorCarga) {
      this.mostrarFeedbackCarga(nivelFormatado, nivelAnterior);
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
  
  // MÉTODO IMPORTANTE: Configurar eventos da aba Combate
  configurarEventosCombate() {
    console.log('⚙️ Configurando eventos da aba Combate...');
    
    // Botões + e - dos modificadores
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
    
    console.log('✅ Eventos da aba Combate configurados');
  }
  
  // CÁLCULOS (mantidos iguais)
  calcularTudo() {
    if (this.atualizando) return;
    if (Date.now() - this.ultimoUpdate < 100) return; // Debounce 100ms
    
    this.atualizando = true;
    this.ultimoUpdate = Date.now();
    
    try {
      // Buscar NHs das perícias
      this.buscarNHs();
      
      // Calcular todas as defesas
      this.calcularEsquiva();
      this.calcularBloqueio();
      this.calcularAparar();
      this.calcularDeslocamento();
      
      // Atualizar interface
      this.atualizarInterface();
      
    } catch (error) {
      console.error('❌ Erro nos cálculos:', error);
    } finally {
      this.atualizando = false;
    }
  }
  
  calcularEsquiva() {
    const { dx, ht } = this.estado.atributos;
    
    // Fórmula: (DX + HT) / 4 + 3
    const base = Math.floor((dx + ht) / 4) + 3;
    const modificador = this.estado.modificadores.esquiva;
    const bonusTotal = this.calcularBonusTotal();
    
    // Aplicar redutor de carga
    let total = base + modificador + bonusTotal + this.estado.redutorCarga;
    
    // Fadiga
    if (this.estado.fadiga.ativa) {
      total = Math.ceil(total / 2);
    }
    
    // Mínimo 1
    this.estado.defesas.esquiva = Math.max(total, 1);
    
    console.log(`🎯 Esquiva: ${base}[base] + ${modificador}[mod] + ${bonusTotal}[bonus] + ${this.estado.redutorCarga}[carga] = ${this.estado.defesas.esquiva}`);
  }
  
  calcularDeslocamento() {
    const { dx, ht } = this.estado.atributos;
    
    // Fórmula: (DX + HT) / 4
    const base = (dx + ht) / 4;
    const modificador = this.estado.modificadores.deslocamento;
    
    // Aplicar redutor de carga
    let total = base + modificador + this.estado.redutorCarga;
    
    // Fadiga
    if (this.estado.fadiga.ativa) {
      total = total / 2;
    }
    
    // Mínimo 0, 2 casas decimais
    this.estado.defesas.deslocamento = Math.max(total, 0);
    
    console.log(`🏃 Deslocamento: ${base.toFixed(2)}[base] + ${modificador}[mod] + ${this.estado.redutorCarga}[carga] = ${this.estado.defesas.deslocamento.toFixed(2)}`);
  }
  
  calcularBloqueio() {
    if (this.estado.nh.escudo === null) {
      this.buscarNHEscudo();
    }
    
    const nhEscudo = this.estado.nh.escudo;
    
    if (!nhEscudo || nhEscudo <= this.estado.atributos.dx) {
      this.estado.defesas.bloqueio = 0;
      return;
    }
    
    const base = Math.floor(nhEscudo / 2) + 3;
    const modificador = this.estado.modificadores.bloqueio;
    const bonusTotal = this.calcularBonusTotal();
    
    const total = base + modificador + bonusTotal;
    
    this.estado.defesas.bloqueio = Math.max(total, 1);
  }
  
  calcularAparar() {
    if (this.estado.nh.arma === null) {
      this.buscarNHArma();
    }
    
    const nhArma = this.estado.nh.arma;
    
    if (!nhArma || nhArma <= this.estado.atributos.dx) {
      this.estado.defesas.aparar = 0;
      return;
    }
    
    const base = Math.floor(nhArma / 2) + 3;
    const modificador = this.estado.modificadores.aparar;
    const bonusTotal = this.calcularBonusTotal();
    
    const total = base + modificador + bonusTotal;
    
    this.estado.defesas.aparar = Math.max(total, 1);
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
    
    const periciasArma = ['Adaga', 'Espada', 'Machado', 'Maça', 'Arco', 'Lança', 'Martelo', 'Faca', 'Bastão', 'Rapieira', 'Sabre', 'Terçado'];
    
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
      for (let pericia of window.estadoPericias.periciasAprendidas) {
        if (!pericia) continue;
        
        const nome = pericia.nomeCompleto || pericia.nome || '';
        
        for (let arma of periciasArma) {
          if (nome.includes(arma)) {
            nivelArma = pericia.nivel || pericia.pontos || 0;
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
        pfAtual = parseInt(pfAtualElement.value) || parseInt(pfAtualElement.textContent) || 10;
      }
      
      if (pfMaxElement) {
        pfMaximo = parseInt(pfMaxElement.textContent) || 10;
      }
      
      const limiteFadiga = Math.ceil(pfMaximo / 3);
      this.estado.fadiga.ativa = pfAtual <= limiteFadiga;
      this.estado.fadiga.pfAtual = pfAtual;
      this.estado.fadiga.pfMaximo = pfMaximo;
      this.estado.fadiga.limiteFadiga = limiteFadiga;
      
    } catch (error) {
      // Silencioso
    }
  }
  
  // ATUALIZAÇÃO DA INTERFACE
  atualizarInterface() {
    // Valores das defesas
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
    
    // Total de bônus
    if (this.elementos.totalBonus) {
      const total = this.calcularBonusTotal();
      this.elementos.totalBonus.textContent = total >= 0 ? `+${total}` : `${total}`;
    }
    
    // Indicador de carga
    this.atualizarIndicadorCarga();
    
    // Indicador de fadiga
    this.atualizarIndicadorFadiga();
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
        indicadorCarga.innerHTML = `
          <div class="carga-info" title="Carga: ${this.estado.nivelCarga} (${this.estado.pesoAtual.toFixed(1)}kg)">
            <span class="carga-icone">⚖️</span>
            <span class="carga-texto">${nivel.charAt(0).toUpperCase() + nivel.slice(1)} (${redutor})</span>
          </div>
        `;
        indicadorCarga.style.display = 'block';
        indicadorCarga.className = `indicador-carga carga-${nivel.replace(' ', '-')}`;
      } else {
        indicadorCarga.style.display = 'none';
      }
    }
  }
  
  atualizarIndicadorFadiga() {
    this.verificarFadiga();
    
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
        background: #e74c3c;
        color: white;
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
    } else {
      indicador.style.display = 'none';
    }
  }
  
  mostrarFeedbackCarga(novoNivel, nivelAnterior = null) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-carga';
    feedback.innerHTML = `
      <i class="fas fa-weight-hanging"></i>
      <span>Carga: ${novoNivel.toUpperCase()} (${this.estado.redutorCarga})</span>
    `;
    
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 15px;
      border-radius: 5px;
      font-size: 13px;
      font-weight: bold;
      z-index: 9999;
      opacity: 0;
      transform: translateX(100px);
      transition: all 0.3s;
      border-left: 4px solid ${this.getCorCarga(novoNivel)};
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.opacity = '1';
      feedback.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translateX(100px)';
      setTimeout(() => feedback.remove(), 300);
    }, 1500);
  }
  
  getCorCarga(nivel) {
    const cores = {
      'nenhuma': '#2ecc71',
      'leve': '#f39c12',
      'média': '#e67e22',
      'media': '#e67e22',
      'pesada': '#e74c3c',
      'muito pesada': '#c0392b'
    };
    return cores[nivel] || '#95a5a6';
  }
  
  forcarRecalculo() {
    console.log('🔄 Forçando recálculo completo...');
    this.carregarValoresIniciais();
    this.calcularTudo();
  }
  
  mostrarStatus() {
    console.log('=== STATUS DEFESAS ===');
    console.log('Atributos:', this.estado.atributos);
    console.log('Defesas:', this.estado.defesas);
    console.log('Carga:', this.estado.nivelCarga, `(${this.estado.redutorCarga})`);
    console.log('Fadiga:', this.estado.fadiga.ativa ? 'Ativa' : 'Inativa');
    console.log('=====================');
  }
}

// SISTEMA GLOBAL
let sistemaDefesasGlobal = null;

function iniciarSistemaDefesas() {
  if (sistemaDefesasGlobal && sistemaDefesasGlobal.iniciado) {
    console.log('⚠️ Sistema já iniciado, recalculando...');
    sistemaDefesasGlobal.forcarRecalculo();
    return sistemaDefesasGlobal;
  }
  
  console.log('🎮 Iniciando novo sistema de defesas...');
  sistemaDefesasGlobal = new SistemaDefesas();
  
  // Pequeno delay para garantir que a aba esteja carregada
  setTimeout(() => {
    sistemaDefesasGlobal.iniciar();
  }, 100);
  
  return sistemaDefesasGlobal;
}

// INICIALIZAÇÃO AUTOMÁTICA (igual técnicas.js)
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM carregado, preparando sistema de defesas...');
  
  // Observar quando a aba Combate for ativada
  const combateTab = document.getElementById('combate');
  if (combateTab) {
    console.log('🎯 Aba Combate encontrada');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          if (combateTab.classList.contains('active')) {
            console.log('🎯 Aba Combate ativada! Iniciando sistema...');
            setTimeout(() => {
              iniciarSistemaDefesas();
            }, 300);
          }
        }
      });
    });
    
    observer.observe(combateTab, { attributes: true });
    
    // Se já estiver ativa, iniciar agora
    if (combateTab.classList.contains('active')) {
      console.log('🎯 Aba Combate já ativa, iniciando...');
      setTimeout(() => {
        iniciarSistemaDefesas();
      }, 500);
    }
  }
});

// FUNÇÕES GLOBAIS (para console)
window.defesa = {
  iniciar: () => iniciarSistemaDefesas(),
  status: () => sistemaDefesasGlobal?.mostrarStatus(),
  recalcular: () => sistemaDefesasGlobal?.forcarRecalculo(),
  atualizarCarga: (nivel) => sistemaDefesasGlobal?.atualizarNivelCarga(nivel),
  testar: () => {
    if (sistemaDefesasGlobal) {
      console.log('🧪 Testando sistema...');
      sistemaDefesasGlobal.estado.atributos.dx = 12;
      sistemaDefesasGlobal.estado.atributos.ht = 12;
      sistemaDefesasGlobal.calcularTudo();
    }
  }
};

// ATALHOS DE CONSOLE
window.DS = () => window.defesa.status();
window.DR = () => window.defesa.recalcular();
window.DC = (nivel) => window.defesa.atualizarCarga(nivel);
window.DT = () => window.defesa.testar();

console.log('✅ Sistema de Defesas carregado!');
console.log('🎮 Comandos: DS() - Status, DR() - Recalcular, DC("leve") - Testar carga, DT() - Teste rápido');