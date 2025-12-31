// defesa.js - SISTEMA COMPLETO E FUNCIONAL - VERSÃO FINAL CORRIGIDA
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
  
  // Cache para verificar mudanças
  this.cacheAtributos = { dx: 10, ht: 10 };
  this.cacheCarga = 'nenhuma';
  
  console.log(' SistemaDefesas criado');
 }

 iniciar() {
  if (this.iniciado) {
   console.log('⚠️ Sistema já iniciado');
   return;
  }
  
  try {
   console.log(' INICIANDO SISTEMA DE DEFESAS...');
   
   // 1. Carregar elementos
   this.carregarElementos();
   console.log('✅ Elementos carregados');
   
   // 2. Carregar valores iniciais
   this.carregarValoresIniciais();
   console.log('✅ Valores iniciais:', this.estado.atributos);
   
   // 3. Configurar observadores de atributos
   this.configurarObservadoresAtributos();
   console.log('✅ Observadores configurados');
   
   // 4. Detectar carga inicial
   this.detectarNivelCargaInicial();
   console.log('✅ Carga detectada:', this.estado.nivelCarga);
   
   // 5. Configurar eventos
   this.configurarEventos();
   console.log('✅ Eventos configurados');
   
   // 6. Iniciar monitoramento de carga
   this.iniciarMonitoramentoCarga();
   console.log('✅ Monitoramento de carga ativo');
   
   // 7. Calcular tudo
   this.calcularTudo();
   console.log('✅ Cálculos realizados');
   
   // 8. Iniciar monitoramento geral
   this.iniciarMonitoramento();
   console.log('✅ Monitoramento geral ativo');
   
   this.iniciado = true;
   
   console.log(' SISTEMA DE DEFESAS INICIADO COM SUCESSO!');
   console.log(' Estado final:', {
    dx: this.estado.atributos.dx,
    ht: this.estado.atributos.ht,
    esquiva: this.estado.defesas.esquiva,
    deslocamento: this.estado.defesas.deslocamento,
    carga: this.estado.nivelCarga,
    redutor: this.estado.redutorCarga
   });
   
  } catch (error) {
   console.error('❌ ERRO ao iniciar sistema:', error);
  }
 }

 carregarElementos() {
  console.log(' Buscando elementos...');
  
  // ATENÇÃO: Os inputs de atributos têm IDs 'DX', 'HT', 'ST', 'IQ'
  this.elementos.dx = document.getElementById('DX');
  this.elementos.ht = document.getElementById('HT');
  
  console.log(' Elemento DX:', this.elementos.dx ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
  console.log(' Elemento HT:', this.elementos.ht ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
  
  if (this.elementos.dx) {
   console.log(' Valor do DX:', this.elementos.dx.value);
  }
  if (this.elementos.ht) {
   console.log(' Valor do HT:', this.elementos.ht.value);
  }
  
  // Elementos da aba Combate
  this.elementos.bonusReflexos = document.getElementById('bonusReflexos');
  this.elementos.bonusEscudo = document.getElementById('bonusEscudo');
  this.elementos.bonusCapa = document.getElementById('bonusCapa');
  this.elementos.bonusOutros = document.getElementById('bonusOutros');
  
  this.elementos.esquivaTotal = document.getElementById('esquivaTotal');
  this.elementos.bloqueioTotal = document.getElementById('bloqueioTotal');
  this.elementos.apararTotal = document.getElementById('apararTotal');
  this.elementos.deslocamentoTotal = document.getElementById('deslocamentoTotal');
  
  this.elementos.totalBonus = document.getElementById('totalBonus');
  
  // Para indicador de carga
  this.elementos.esquivaInfo = document.querySelector('.defesa-item:nth-child(1) .defesa-info');
 }

 carregarValoresIniciais() {
  console.log(' Carregando valores iniciais dos atributos...');
  
  // DX
  if (this.elementos.dx) {
   const dxValor = parseInt(this.elementos.dx.value);
   this.estado.atributos.dx = isNaN(dxValor) ? 10 : dxValor;
   this.cacheAtributos.dx = this.estado.atributos.dx;
   console.log(` DX: ${this.estado.atributos.dx}`);
  } else {
   console.warn('⚠️ Input DX não encontrado, usando valor padrão 10');
   this.estado.atributos.dx = 10;
   this.cacheAtributos.dx = 10;
  }
  
  // HT
  if (this.elementos.ht) {
   const htValor = parseInt(this.elementos.ht.value);
   this.estado.atributos.ht = isNaN(htValor) ? 10 : htValor;
   this.cacheAtributos.ht = this.estado.atributos.ht;
   console.log(` HT: ${this.estado.atributos.ht}`);
  } else {
   console.warn('⚠️ Input HT não encontrado, usando valor padrão 10');
   this.estado.atributos.ht = 10;
   this.cacheAtributos.ht = 10;
  }
  
  // Bônus da aba Combate
  ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
   const input = document.getElementById(`bonus${bonus}`);
   if (input) {
    this.estado.bonus[bonus.toLowerCase()] = parseInt(input.value) || 0;
   }
  });
  
  // Modificadores da aba Combate
  ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
   const input = document.getElementById(`${defesa}Mod`);
   if (input) {
    this.estado.modificadores[defesa] = parseInt(input.value) || 0;
   }
  });
  
  console.log('✅ Valores iniciais carregados com sucesso');
 }

 // MÉTODO CORRIGIDO: Configurar observadores de atributos
 configurarObservadoresAtributos() {
  console.log('️ Configurando observadores de atributos...');
  
  // Observar mudanças em DX
  if (this.elementos.dx) {
   console.log('✅ Observador para DX configurado');
   
   this.elementos.dx.addEventListener('input', (e) => {
    this.handleAtributoChange('dx', e.target.value);
   });
   
   this.elementos.dx.addEventListener('change', (e) => {
    this.handleAtributoChange('dx', e.target.value);
   });
   
   // Observador de mutação (para mudanças via código)
   const observerDX = new MutationObserver(() => {
    const novoValor = this.elementos.dx.value;
    this.handleAtributoChange('dx', novoValor);
   });
   
   observerDX.observe(this.elementos.dx, {
    attributes: true,
    attributeFilter: ['value'],
    childList: false,
    subtree: false
   });
   
   this.observadores.push(observerDX);
  }
  
  // Observar mudanças em HT
  if (this.elementos.ht) {
   console.log('✅ Observador para HT configurado');
   
   this.elementos.ht.addEventListener('input', (e) => {
    this.handleAtributoChange('ht', e.target.value);
   });
   
   this.elementos.ht.addEventListener('change', (e) => {
    this.handleAtributoChange('ht', e.target.value);
   });
   
   // Observador de mutação
   const observerHT = new MutationObserver(() => {
    const novoValor = this.elementos.ht.value;
    this.handleAtributoChange('ht', novoValor);
   });
   
   observerHT.observe(this.elementos.ht, {
    attributes: true,
    attributeFilter: ['value'],
    childList: false,
    subtree: false
   });
   
   this.observadores.push(observerHT);
  }
  
  // Fallback: Polling a cada 1 segundo
  this.iniciarPollingAtributos();
 }

 handleAtributoChange(atributo, valorString) {
  const valor = parseInt(valorString) || 10;
  
  // Validar limites
  if (valor < 1 || valor > 40) {
   console.warn(`⚠️ Valor de ${atributo.toUpperCase()} fora dos limites: ${valor}`);
   return;
  }
  
  // Verificar se mudou
  if (this.cacheAtributos[atributo] === valor) {
   return; // Não mudou
  }
  
  console.log(` ${atributo.toUpperCase()} alterado: ${this.cacheAtributos[atributo]} → ${valor}`);
  
  // Atualizar cache e estado
  this.cacheAtributos[atributo] = valor;
  this.estado.atributos[atributo] = valor;
  
  // Recalcular tudo
  this.calcularTudo();
  
  // Feedback visual
  this.mostrarFeedbackAtributo(atributo, valor);
 }

 iniciarPollingAtributos() {
  console.log('⏰ Polling de atributos iniciado (1s)');
  
  setInterval(() => {
   if (this.atualizando) return;
   
   // Verificar DX
   if (this.elementos.dx) {
    const novoDX = parseInt(this.elementos.dx.value) || 10;
    if (novoDX !== this.cacheAtributos.dx) {
     console.log(` Polling detectou mudança DX: ${this.cacheAtributos.dx} → ${novoDX}`);
     this.cacheAtributos.dx = novoDX;
     this.estado.atributos.dx = novoDX;
     this.calcularTudo();
    }
   }
   
   // Verificar HT
   if (this.elementos.ht) {
    const novoHT = parseInt(this.elementos.ht.value) || 10;
    if (novoHT !== this.cacheAtributos.ht) {
     console.log(` Polling detectou mudança HT: ${this.cacheAtributos.ht} → ${novoHT}`);
     this.cacheAtributos.ht = novoHT;
     this.estado.atributos.ht = novoHT;
     this.calcularTudo();
    }
   }
  }, 1000); // Verificar a cada 1 segundo
 }

 detectarNivelCargaInicial() {
  try {
   console.log(' Detectando nível de carga inicial...');
   
   // Método 1: Sistema de equipamentos
   if (window.sistemaEquipamentos && window.sistemaEquipamentos.nivelCargaAtual) {
    this.estado.nivelCarga = window.sistemaEquipamentos.nivelCargaAtual;
    this.estado.pesoAtual = window.sistemaEquipamentos.pesoAtual || 0;
    this.estado.pesoMaximo = window.sistemaEquipamentos.pesoMaximo || 100;
    console.log(` Carga do sistema: ${this.estado.nivelCarga}`);
   }
   
   // Método 2: Elemento HTML
   const cargaElement = document.getElementById('nivelCarga');
   if (cargaElement && cargaElement.textContent) {
    const nivel = cargaElement.textContent.toLowerCase().trim();
    if (nivel && nivel !== 'undefined') {
     this.estado.nivelCarga = nivel;
     console.log(` Carga do elemento: ${nivel}`);
    }
   }
   
   // Garantir valor padrão
   if (!this.estado.nivelCarga || this.estado.nivelCarga === 'undefined') {
    this.estado.nivelCarga = 'nenhuma';
   }
   
   // Calcular redutor
   this.estado.redutorCarga = this.getRedutorCarga(this.estado.nivelCarga);
   this.cacheCarga = this.estado.nivelCarga;
   
   console.log(`✅ Carga: ${this.estado.nivelCarga}, Redutor: ${this.estado.redutorCarga}`);
   
  } catch (error) {
   console.warn('⚠️ Erro detectando carga:', error);
   this.estado.nivelCarga = 'nenhuma';
   this.estado.redutorCarga = 0;
   this.cacheCarga = 'nenhuma';
  }
 }

 iniciarMonitoramentoCarga() {
  console.log('️ Iniciando monitoramento de carga...');
  
  // Eventos do sistema de equipamentos
  document.addEventListener('equipamentosAtualizados', (e) => {
   if (e.detail && e.detail.nivelCargaAtual) {
    console.log(' Evento de carga:', e.detail.nivelCargaAtual);
    this.atualizarNivelCarga(e.detail.nivelCargaAtual, e.detail.pesoAtual, e.detail.pesoMaximo);
   }
  });
  
  // Polling para carga
  setInterval(() => {
   if (this.atualizando) return;
   
   if (window.sistemaEquipamentos &&
     window.sistemaEquipamentos.nivelCargaAtual &&
     window.sistemaEquipamentos.nivelCargaAtual !== this.cacheCarga) {
    
    console.log(` Polling detectou carga: ${this.cacheCarga} → ${window.sistemaEquipamentos.nivelCargaAtual}`);
    
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
  
  if (!nivelFormatado || nivelFormatado === 'undefined') {
   return;
  }
  
  if (nivelFormatado === this.cacheCarga) {
   return;
  }
  
  console.log(` Atualizando carga: ${this.cacheCarga} → ${nivelFormatado}`);
  
  this.estado.nivelCarga = nivelFormatado;
  this.estado.redutorCarga = this.getRedutorCarga(nivelFormatado);
  this.cacheCarga = nivelFormatado;
  
  if (pesoAtual !== null) this.estado.pesoAtual = pesoAtual;
  if (pesoMaximo !== null) this.estado.pesoMaximo = pesoMaximo;
  
  // Recalcular esquiva e deslocamento
  this.calcularEsquiva();
  this.calcularDeslocamento();
  this.atualizarInterface();
  
  // Feedback
  this.mostrarFeedbackCarga(nivelFormatado);
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
   'muito-pesada': -4
  };
  
  return redutores[nivel] || 0;
 }

 calcularTudo() {
  if (this.atualizando) return;
  
  this.atualizando = true;
  
  try {
   // Buscar NHs
   this.buscarNHs();
   
   // Calcular defesas
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
  
  console.log(` Esquiva: ${base}[base] + ${modificador}[mod] + ${bonusTotal}[bonus] + ${this.estado.redutorCarga}[carga] = ${this.estado.defesas.esquiva}`);
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
  
  console.log(` Deslocamento: ${base.toFixed(2)}[base] + ${modificador}[mod] + ${this.estado.redutorCarga}[carga] = ${this.estado.defesas.deslocamento.toFixed(2)}`);
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
     <div class="carga-info" title="Carga atual: ${this.estado.nivelCarga}">
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

 mostrarFeedbackAtributo(atributo, valor) {
  const feedback = document.createElement('div');
  feedback.className = 'feedback-atributo';
  feedback.innerHTML = `<i class="fas fa-sync-alt"></i> ${atributo.toUpperCase()}: ${valor}`;
  
  feedback.style.cssText = `
   position: fixed;
   top: 20px;
   right: 20px;
   background: rgba(41, 128, 185, 0.9);
   color: white;
   padding: 8px 15px;
   border-radius: 5px;
   font-size: 13px;
   font-weight: bold;
   z-index: 9999;
   opacity: 0;
   transform: translateX(100px);
   transition: all 0.3s;
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
  }, 2000);
 }

 mostrarFeedbackCarga(novoNivel) {
  const feedback = document.createElement('div');
  feedback.className = 'feedback-carga';
  feedback.innerHTML = `<i class="fas fa-weight-hanging"></i> Carga: ${novoNivel.toUpperCase()} (${this.estado.redutorCarga})`;
  
  feedback.style.cssText = `
   position: fixed;
   top: 60px;
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
  }, 2000);
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

 configurarEventos() {
  // Bônus da aba Combate
  ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
   const input = document.getElementById(`bonus${bonus}`);
   if (input) {
    input.addEventListener('change', () => {
     this.estado.bonus[bonus.toLowerCase()] = parseInt(input.value) || 0;
     this.calcularTudo();
    });
   }
  });
  
  // Modificadores da aba Combate
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

 iniciarMonitoramento() {
  // Verificar fadiga periodicamente
  setInterval(() => {
   this.verificarFadiga();
   this.calcularTudo();
  }, 3000);
 }

 forcarRecalculo() {
  console.log(' Forçando recálculo completo...');
  this.carregarValoresIniciais();
  this.calcularTudo();
 }

 mostrarStatus() {
  console.log('=== STATUS DEFESAS ===');
  console.log('Atributos:', this.estado.atributos);
  console.log('Defesas:', this.estado.defesas);
  console.log('Carga:', this.estado.nivelCarga, `(${this.estado.redutorCarga})`);
  console.log('=====================');
 }
}


// Sistema global
let sistemaDefesasGlobal = null;


function iniciarSistemaDefesas() {
 if (sistemaDefesasGlobal && sistemaDefesasGlobal.iniciado) {
  console.log('⚠️ Sistema já iniciado, recalculando...');
  sistemaDefesasGlobal.forcarRecalculo();
  return sistemaDefesasGlobal;
 }

 console.log(' Iniciando novo sistema de defesas...');
 sistemaDefesasGlobal = new SistemaDefesas();

 setTimeout(() => {
  sistemaDefesasGlobal.iniciar();
 }, 500);

 return sistemaDefesasGlobal;
}


// Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
 console.log(' DOM carregado, preparando sistema de defesas...');

 // Observar quando a aba Combate for ativada
 const combateTab = document.getElementById('combate');
 if (combateTab) {
  console.log(' Aba Combate encontrada');
  
  const observer = new MutationObserver((mutations) => {
   mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class') {
     console.log(' Classe da aba Combate alterada');
     if (combateTab.classList.contains('active')) {
      console.log(' Aba Combate ativada!');
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
   console.log(' Aba Combate já ativa, iniciando...');
   setTimeout(() => {
    iniciarSistemaDefesas();
   }, 500);
  }
 } else {
  console.warn('⚠️ Aba Combate não encontrada!');
 }
});


// Funções globais
window.defesa = {
 iniciar: () => iniciarSistemaDefesas(),
 status: () => sistemaDefesasGlobal?.mostrarStatus(),
 recalcular: () => sistemaDefesasGlobal?.forcarRecalculo(),
 atualizarCarga: (nivel) => sistemaDefesasGlobal?.atualizarNivelCarga(nivel)
};


// Atalhos de console
window.DS = () => window.defesa.status();
window.DR = () => window.defesa.recalcular();
window.DC = (nivel) => window.defesa.atualizarCarga(nivel);


console.log('✅ Sistema de Defesas carregado!');
console.log(' Comandos: DS() - Status, DR() - Recalcular, DC("leve") - Testar carga');
