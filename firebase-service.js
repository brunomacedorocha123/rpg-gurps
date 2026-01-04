// ===========================================
// DASHBOARD-SERVICE.JS - Serviço de Dashboard
// ===========================================
import firebaseService from './firebase-service.js';

class DashboardService {
  constructor() {
    this.dashboardData = {};
    this.listeners = [];
    this.isInitialized = false;
    
    console.log('📊 DashboardService iniciado');
    
    // Aguardar Firebase estar pronto
    this.waitForFirebase().then(() => {
      this.initialize();
    });
  }
  
  async waitForFirebase() {
    return new Promise((resolve) => {
      const check = () => {
        if (firebaseService.getCharacterId()) {
          resolve(true);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }
  
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🚀 Inicializando DashboardService...');
    
    try {
      // Carregar dados iniciais
      await this.loadDashboardData();
      
      // Configurar escuta em tempo real
      this.setupRealtimeListener();
      
      this.isInitialized = true;
      console.log('✅ DashboardService inicializado');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar DashboardService:', error);
    }
  }
  
  async loadDashboardData() {
    try {
      // Carregar do FirebaseService (que já tem os dados)
      this.dashboardData = firebaseService.getDashboardData() || {};
      
      console.log('📥 Dashboard carregado:', this.dashboardData);
      
      // Notificar listeners
      this.notifyListeners();
      
      return this.dashboardData;
      
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error);
      return {};
    }
  }
  
  setupRealtimeListener() {
    // Escutar eventos do firebaseService
    document.addEventListener('dashboard-updated', (event) => {
      this.dashboardData = event.detail;
      console.log('🔄 Dashboard atualizado via evento:', this.dashboardData);
      this.notifyListeners();
    });
    
    document.addEventListener('dashboard-realtime-update', (event) => {
      this.dashboardData = event.detail;
      console.log('🔄 Dashboard atualizado em tempo real');
      this.notifyListeners();
    });
    
    // Escutar atualizações de módulos específicos
    document.addEventListener('firebase-saved', (event) => {
      const { module, data } = event.detail;
      this.handleModuleUpdate(module, data);
    });
    
    console.log('👂 DashboardService escutando eventos');
  }
  
  handleModuleUpdate(moduleName, moduleData) {
    // Atualizar contadores ou dados específicos localmente
    switch(moduleName) {
      case 'vantagens':
        this.updateCounter('vantagens', moduleData);
        break;
      case 'desvantagens':
        this.updateCounter('desvantagens', moduleData);
        break;
      case 'pericias':
        this.updateCounter('pericias', moduleData);
        break;
      case 'magias':
        this.updateCounter('magias', moduleData);
        break;
    }
  }
  
  updateCounter(counterName, data) {
    if (!this.dashboardData.contadores) {
      this.dashboardData.contadores = {};
    }
    
    const count = Array.isArray(data) ? data.length : 0;
    this.dashboardData.contadores[counterName] = count;
    
    console.log(`📊 Contador ${counterName}: ${count}`);
    
    this.notifyListeners();
  }
  
  // ===========================================
  // FUNÇÕES PARA OUTROS MÓDULOS REPORTAREM
  // ===========================================
  
  reportAttributeChange(atributosData) {
    console.log('📤 Reportando mudança de atributos para dashboard:', atributosData);
    
    // Atualizar localmente
    this.dashboardData.atributosResumo = {
      ST: atributosData.ST || 10,
      DX: atributosData.DX || 10,
      IQ: atributosData.IQ || 10,
      HT: atributosData.HT || 10
    };
    
    // Calcular derivados se necessário
    if (atributosData.bonus) {
      this.dashboardData.totaisResumo = {
        PV: (atributosData.ST || 10) + (atributosData.bonus.PV || 0),
        PF: (atributosData.HT || 10) + (atributosData.bonus.PF || 0),
        Vontade: (atributosData.IQ || 10) + (atributosData.bonus.Vontade || 0),
        Percepcao: (atributosData.IQ || 10) + (atributosData.bonus.Percepcao || 0),
        Deslocamento: ((atributosData.HT + atributosData.DX) / 4).toFixed(2)
      };
    }
    
    this.notifyListeners();
  }
  
  reportPointsChange(pointsData) {
    console.log('📤 Reportando mudança de pontos para dashboard:', pointsData);
    
    this.dashboardData.pontos = pointsData.total || pointsData.totalPontos || 0;
    
    if (pointsData.distribuicao) {
      this.dashboardData.pontosDistribuicao = pointsData.distribuicao;
    }
    
    this.notifyListeners();
  }
  
  // ===========================================
  // GETTERS PARA A INTERFACE
  // ===========================================
  
  getResumo() {
    return {
      nome: this.dashboardData.nome || "Novo Personagem",
      status: this.dashboardData.status || "rascunho",
      pontos: this.dashboardData.pontos || 0,
      atributos: this.dashboardData.atributosResumo || {
        ST: 10, DX: 10, IQ: 10, HT: 10
      },
      totais: this.dashboardData.totaisResumo || {
        PV: 10, PF: 10, Vontade: 10, Percepcao: 10, Deslocamento: "5.00"
      },
      cargas: this.dashboardData.cargasResumo || {},
      contadores: this.dashboardData.contadores || {
        vantagens: 0,
        desvantagens: 0,
        pericias: 0,
        magias: 0,
        equipamentos: 0,
        relacionamentos: 0,
        idiomas: 0
      },
      ultimaAtualizacao: this.dashboardData.ultimaAtualizacao || new Date().toISOString()
    };
  }
  
  getAtributos() {
    return this.dashboardData.atributosResumo || {
      ST: 10, DX: 10, IQ: 10, HT: 10
    };
  }
  
  getPontos() {
    return this.dashboardData.pontos || 0;
  }
  
  getPontosDistribuicao() {
    return this.dashboardData.pontosDistribuicao || {};
  }
  
  getContadores() {
    return this.dashboardData.contadores || {
      vantagens: 0,
      desvantagens: 0,
      pericias: 0,
      magias: 0,
      equipamentos: 0,
      relacionamentos: 0,
      idiomas: 0
    };
  }
  
  // ===========================================
  // SISTEMA DE LISTENERS
  // ===========================================
  
  addListener(callback) {
    this.listeners.push(callback);
    
    // Notificar imediatamente com dados atuais
    callback(this.getResumo());
  }
  
  notifyListeners() {
    const data = this.getResumo();
    
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Erro em listener do dashboard:', error);
      }
    });
  }
  
  // ===========================================
  // FUNÇÕES PARA ATUALIZAÇÃO MANUAL
  // ===========================================
  
  async forceRefresh() {
    console.log('🔄 Forçando atualização do dashboard...');
    
    await this.loadDashboardData();
    
    return this.getResumo();
  }
  
  async updateCharacterName(nome) {
    try {
      this.dashboardData.nome = nome;
      await firebaseService.saveModule('nome', nome);
      
      this.notifyListeners();
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao atualizar nome:', error);
      return false;
    }
  }
}

// ===========================================
// INSTÂNCIA GLOBAL
// ===========================================

const dashboardService = new DashboardService();

// Exportar para window
if (typeof window !== 'undefined') {
  window.dashboardService = dashboardService;
}

export default dashboardService;

console.log('✅ dashboard-service.js carregado');