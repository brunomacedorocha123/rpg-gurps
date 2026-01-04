// ===========================================
// FIREBASE-SERVICE.JS - VERSÃO COMPLETA E FUNCIONAL
// SEM MERCY, SEM ERROS, SÓ FUNÇÃO
// ===========================================

import { db, auth } from './firebase-config.js';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

class FirebaseService {
  constructor() {
    this.userId = null;
    this.characterId = null;
    this.characterData = {};
    this.unsubscribe = null;
    this.isInitializing = false;
    this.initialized = false;
    
    console.log('🔥 FirebaseService criado');
    
    // Iniciar AUTOMATICAMENTE
    this.initialize();
  }

  async initialize() {
    if (this.isInitializing || this.initialized) return;
    this.isInitializing = true;
    
    console.log('🚀 INICIANDO FIREBASE SERVICE...');
    
    try {
      // 1. AUTENTICAÇÃO
      await this.setupAuth();
      
      // 2. CONFIGURAR PERSONAGEM DA URL
      await this.setupCharacterFromURL();
      
      // 3. CARREGAR DADOS EXISTENTES
      await this.loadCharacter();
      
      this.initialized = true;
      console.log('✅✅✅ FIREBASE SERVICE INICIALIZADO COM SUCESSO');
      
      // DISPARAR EVENTO DE PRONTIDÃO
      this.dispatchEvent('firebase-ready');
      
    } catch (error) {
      console.error('❌❌❌ ERRO NA INICIALIZAÇÃO:', error);
      this.initialized = false;
    } finally {
      this.isInitializing = false;
    }
  }

  async setupAuth() {
    return new Promise((resolve, reject) => {
      console.log('🔐 Configurando autenticação...');
      
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          // USUÁRIO JÁ LOGADO
          this.userId = user.uid;
          console.log('✅ Usuário autenticado:', this.userId);
          resolve(true);
        } else {
          // LOGIN ANÔNIMO AUTOMÁTICO
          try {
            console.log('👤 Fazendo login anônimo...');
            const result = await signInAnonymously(auth);
            this.userId = result.user.uid;
            console.log('✅ Novo usuário anônimo:', this.userId);
            resolve(true);
          } catch (authError) {
            console.error('❌ Erro de autenticação:', authError);
            
            // MODO EMERGÊNCIA - LOCALSTORAGE
            this.userId = 'local_' + Date.now();
            console.log('⚠️ Modo emergência - ID local:', this.userId);
            resolve(true);
          }
        }
      });
      
      // TIMEOUT DE SEGURANÇA
      setTimeout(() => {
        if (!this.userId) {
          console.warn('⚠️ Timeout de autenticação');
          this.userId = 'local_' + Date.now();
          resolve(true);
        }
      }, 10000);
    });
  }

  async setupCharacterFromURL() {
    console.log('🔗 Verificando URL...');
    
    // PEGAR ID DA URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlCharId = urlParams.get('id');
    
    if (urlCharId) {
      // USAR ID DA URL
      this.characterId = urlCharId;
      console.log('📂 Usando personagem da URL:', this.characterId);
    } else {
      // CRIAR NOVO PERSONAGEM
      this.characterId = 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      console.log('🆕 Novo personagem criado:', this.characterId);
      
      // ATUALIZAR URL
      this.updateURL();
    }
    
    // SALVAR NO LOCALSTORAGE PARA BACKUP
    localStorage.setItem('lastCharacterId', this.characterId);
  }

  updateURL() {
    if (!this.characterId) return;
    
    const newUrl = window.location.pathname + '?id=' + this.characterId;
    window.history.replaceState({}, '', newUrl);
    console.log('🔗 URL atualizada:', newUrl);
  }

  // ===========================================
  // SALVAMENTO - FUNÇÃO PRINCIPAL
  // ===========================================

  async saveModule(moduleName, moduleData) {
    console.log(`💾 SALVANDO: ${moduleName}`, moduleData);
    
    try {
      // VERIFICAÇÕES CRÍTICAS
      if (!this.userId) {
        console.error('❌ userId não definido');
        await this.initialize();
      }
      
      if (!this.characterId) {
        console.error('❌ characterId não definido');
        await this.setupCharacterFromURL();
      }
      
      if (!this.initialized) {
        console.warn('⚠️ Firebase não inicializado, tentando...');
        await this.initialize();
      }
      
      // PREPARAR DADOS
      const dadosParaSalvar = {
        [moduleName]: moduleData,
        userId: this.userId,
        atualizadoEm: serverTimestamp(),
        ultimaModificacao: new Date().toISOString()
      };
      
      console.log('📦 Dados preparados:', dadosParaSalvar);
      
      // REFERÊNCIA DO DOCUMENTO
      const docRef = doc(db, "personagens", this.characterId);
      
      // SALVAR NO FIREBASE (MERGE = atualizar sem apagar)
      await setDoc(docRef, dadosParaSalvar, { merge: true });
      
      // ATUALIZAR CACHE LOCAL
      this.characterData[moduleName] = moduleData;
      
      console.log(`✅✅✅ ${moduleName} SALVO COM SUCESSO!`);
      console.log('   Documento:', this.characterId);
      console.log('   Collection: personagens');
      
      // DISPARAR EVENTO DE SALVAMENTO
      this.dispatchEvent('firebase-saved', { module: moduleName, data: moduleData });
      
      return true;
      
    } catch (error) {
      console.error(`❌❌❌ ERRO AO SALVAR ${moduleName}:`, error);
      console.error('   Código:', error.code);
      console.error('   Mensagem:', error.message);
      
      // FALLBACK PARA LOCALSTORAGE
      this.saveToLocalStorage(moduleName, moduleData);
      
      // DISPARAR EVENTO DE ERRO
      this.dispatchEvent('firebase-error', { 
        module: moduleName, 
        error: error.message 
      });
      
      return false;
    }
  }

  // ===========================================
  // CARREGAMENTO - FUNÇÃO PRINCIPAL
  // ===========================================

  async loadCharacter(characterId = null) {
    console.log('📥 CARREGANDO PERSONAGEM...');
    
    try {
      // USAR ID ESPECÍFICO OU O ATUAL
      const loadId = characterId || this.characterId;
      
      if (!loadId) {
        console.error('❌ Nenhum characterId para carregar');
        return this.loadFromLocalStorage();
      }
      
      // ATUALIZAR ID SE FOR DIFERENTE
      if (characterId && characterId !== this.characterId) {
        this.characterId = characterId;
        this.updateURL();
      }
      
      console.log('   ID do personagem:', loadId);
      
      // CARREGAR DO FIREBASE
      const docRef = doc(db, "personagens", loadId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.characterData = docSnap.data();
        console.log('✅ Personagem carregado do Firebase:', this.characterData);
        
        // DISPARAR EVENTO DE CARREGAMENTO
        this.dispatchEvent('firebase-loaded', { data: this.characterData });
        
        // SALVAR BACKUP LOCAL
        this.saveBackupToLocalStorage();
        
        return this.characterData;
      } else {
        console.log('📭 Personagem não encontrado no Firebase');
        
        // TENTAR CARREGAR DO LOCALSTORAGE
        const localData = this.loadFromLocalStorage();
        if (Object.keys(localData).length > 0) {
          this.characterData = localData;
          console.log('✅ Dados carregados do localStorage:', this.characterData);
          return this.characterData;
        }
        
        return {};
      }
      
    } catch (error) {
      console.error('❌ ERRO AO CARREGAR:', error);
      
      // FALLBACK PARA LOCALSTORAGE
      return this.loadFromLocalStorage();
    }
  }

  // ===========================================
  // FUNÇÕES AUXILIARES
  // ===========================================

  async savePoints(pointsData) {
    console.log('💰 Salvando pontos...', pointsData);
    return this.saveModule('pontos', pointsData);
  }

  async saveCharacterName(name) {
    console.log('🏷️ Salvando nome:', name);
    return this.saveModule('info', { nome: name, atualizadoEm: new Date().toISOString() });
  }

  subscribeToCharacter(callback) {
    if (!this.characterId) {
      console.error('❌ Não é possível escutar sem characterId');
      return null;
    }
    
    console.log('👂 Inscrito em mudanças em tempo real');
    
    const docRef = doc(db, "personagens", this.characterId);
    
    // CANCELAR INSCRIÇÃO ANTERIOR
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    // ESCUTAR MUDANÇAS
    this.unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.characterData = data;
        console.log('🔄 Dados atualizados em tempo real');
        
        // EXECUTAR CALLBACK
        if (callback && typeof callback === 'function') {
          callback(data);
        }
        
        // DISPARAR EVENTO
        this.dispatchEvent('firebase-updated', { data });
      }
    }, (error) => {
      console.error('❌ Erro na escuta em tempo real:', error);
    });
    
    return this.unsubscribe;
  }

  // ===========================================
  // LOCALSTORAGE (FALLBACK)
  // ===========================================

  saveToLocalStorage(moduleName, moduleData) {
    try {
      const key = `gurps_${this.characterId}_${moduleName}`;
      localStorage.setItem(key, JSON.stringify({
        data: moduleData,
        timestamp: new Date().toISOString()
      }));
      console.log('📦 Salvado no localStorage:', key);
    } catch (error) {
      console.error('❌ Erro no localStorage:', error);
    }
  }

  saveBackupToLocalStorage() {
    try {
      const key = `gurps_backup_${this.characterId}`;
      localStorage.setItem(key, JSON.stringify({
        data: this.characterData,
        timestamp: new Date().toISOString(),
        characterId: this.characterId
      }));
      console.log('💾 Backup salvo no localStorage');
    } catch (error) {
      console.error('❌ Erro no backup:', error);
    }
  }

  loadFromLocalStorage() {
    try {
      const data = {};
      
      // PROCURAR DADOS DESTE PERSONAGEM
      const prefix = `gurps_${this.characterId}_`;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(prefix)) {
          const moduleName = key.replace(prefix, '');
          const stored = JSON.parse(localStorage.getItem(key));
          data[moduleName] = stored.data;
        }
      }
      
      console.log('📦 Dados do localStorage:', Object.keys(data).length > 0 ? data : 'VAZIO');
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao carregar do localStorage:', error);
      return {};
    }
  }

  // ===========================================
  // SISTEMA DE EVENTOS
  // ===========================================

  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { 
      detail: { ...detail, characterId: this.characterId }
    });
    document.dispatchEvent(event);
  }

  // ===========================================
  // GETTERS E UTILITÁRIOS
  // ===========================================

  getCharacterId() {
    return this.characterId;
  }

  getUserId() {
    return this.userId;
  }

  getCharacterData() {
    return this.characterData;
  }

  isReady() {
    return this.initialized;
  }

  clear() {
    this.characterId = null;
    this.characterData = {};
    
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    console.log('🧹 FirebaseService limpo');
  }
}

// ===========================================
// INSTÂNCIA GLOBAL
// ===========================================

// CRIAR ÚNICA INSTÂNCIA
const firebaseService = new FirebaseService();

// EXPORTAR PARA USO GLOBAL
export default firebaseService;

// EXPORTAR TAMBÉM PARA WINDOW (SE PRECISAR)
if (typeof window !== 'undefined') {
  window.firebaseService = firebaseService;
}

console.log('✅ firebase-service.js CARREGADO - PRONTO PARA AÇÃO');