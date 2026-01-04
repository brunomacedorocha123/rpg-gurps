// js/firebase-service.js
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
    
    console.log('🔥 FirebaseService iniciado');
    
    // Iniciar quando DOM carregar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  async initialize() {
    console.group('🚀 INICIALIZANDO FIREBASE SERVICE');
    
    try {
      // 1. CONFIGURAR FIREBASE
      await this.setupFirebase();
      
      // 2. AUTENTICAÇÃO
      await this.setupAuth();
      
      // 3. DEFINIR CHARACTER ID (CRÍTICO!)
      await this.setCharacterId();
      
      // 4. CARREGAR DADOS EXISTENTES
      await this.loadCharacter();
      
      console.log('✅✅✅ FIREBASE SERVICE PRONTO');
      console.groupEnd();
      
      // Disparar evento
      this.dispatchEvent('firebase-ready');
      
    } catch (error) {
      console.error('❌ ERRO NA INICIALIZAÇÃO:', error);
      console.groupEnd();
    }
  }

  async setupFirebase() {
    // Já configurado no firebase-config.js
    console.log('✅ Firebase configurado');
  }

  async setupAuth() {
    return new Promise((resolve) => {
      console.log('🔐 Configurando autenticação...');
      
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userId = user.uid;
          console.log('✅ Usuário autenticado:', this.userId);
          resolve();
        } else {
          try {
            const result = await signInAnonymously(auth);
            this.userId = result.user.uid;
            console.log('✅ Novo usuário anônimo:', this.userId);
            resolve();
          } catch (error) {
            console.warn('⚠️ Erro de autenticação, usando local');
            this.userId = 'local_' + Date.now();
            resolve();
          }
        }
      });
    });
  }

  async setCharacterId() {
    console.log('🎯 Definindo Character ID...');
    
    // ORDEM DE PRIORIDADE:
    // 1. URL (?id=XXXX)
    // 2. localStorage
    // 3. sessionStorage
    // 4. Criar novo (APENAS SE NÃO EXISTIR NENHUM)
    
    const urlParams = new URLSearchParams(window.location.search);
    let charId = urlParams.get('id');
    
    if (charId) {
      console.log('📌 ID da URL:', charId);
    } else {
      charId = localStorage.getItem('gurps_character_id');
      if (charId) console.log('📌 ID do localStorage:', charId);
    }
    
    if (!charId) {
      charId = sessionStorage.getItem('character_id');
      if (charId) console.log('📌 ID do sessionStorage:', charId);
    }
    
    // SE NÃO TEM NENHUM ID -> CRIAR NOVO
    if (!charId) {
      charId = 'char_' + Date.now();
      console.log('🆕 NOVO Character ID criado:', charId);
      
      // Criar documento vazio no Firebase
      await this.createEmptyCharacter(charId);
    }
    
    this.characterId = charId;
    
    // SALVAR EM TODOS OS LUGARES
    this.saveCharacterIdEverywhere(charId);
    
    console.log('🎯 Character ID DEFINITIVO:', this.characterId);
  }

  async createEmptyCharacter(charId) {
    try {
      const docRef = doc(db, "personagens", charId);
      await setDoc(docRef, {
        userId: this.userId,
        nome: "Novo Personagem",
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      });
      console.log('📄 Documento vazio criado no Firebase');
    } catch (error) {
      console.error('❌ Erro ao criar documento:', error);
    }
  }

  saveCharacterIdEverywhere(charId) {
    // 1. URL
    const newUrl = window.location.pathname + '?id=' + charId;
    window.history.replaceState({}, '', newUrl);
    
    // 2. localStorage (PERMANENTE)
    localStorage.setItem('gurps_character_id', charId);
    
    // 3. sessionStorage (SESSÃO)
    sessionStorage.setItem('character_id', charId);
    
    // 4. Cookie (opcional)
    document.cookie = `character_id=${charId}; path=/; max-age=${60*60*24*365}`;
    
    console.log('💾 ID salvo em todos os lugares');
  }

  async loadCharacter() {
    console.log('📥 Carregando personagem...');
    
    if (!this.characterId) {
      console.error('❌ Nenhum characterId para carregar');
      return {};
    }
    
    try {
      const docRef = doc(db, "personagens", this.characterId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.characterData = docSnap.data();
        console.log('✅ Personagem carregado do Firebase:', this.characterData);
        
        // Disparar evento com os dados
        this.dispatchEvent('firebase-loaded', this.characterData);
        
        return this.characterData;
      } else {
        console.log('📭 Personagem não encontrado no Firebase');
        return {};
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar:', error);
      return {};
    }
  }

  // ===========================================
  // SALVAMENTO - FUNÇÃO PRINCIPAL
  // ===========================================

  async saveModule(moduleName, moduleData) {
    console.log(`💾 SALVANDO: ${moduleName}`, moduleData);
    
    // VERIFICAÇÕES CRÍTICAS
    if (!this.characterId) {
      console.error('❌ ERRO: characterId não definido!');
      await this.setCharacterId(); // Tenta recuperar
    }
    
    if (!this.userId) {
      console.error('❌ ERRO: userId não definido!');
      return false;
    }
    
    console.log('✅ IDs válidos:', {
      characterId: this.characterId,
      userId: this.userId
    });
    
    try {
      // Dados para salvar
      const updateData = {
        [moduleName]: moduleData,
        userId: this.userId,
        atualizadoEm: serverTimestamp()
      };
      
      console.log('📦 Enviando para Firebase:', updateData);
      
      // Referência do documento
      const docRef = doc(db, "personagens", this.characterId);
      
      // ⚠️ IMPORTANTE: setDoc com merge:true para ATUALIZAR, não criar novo
      await setDoc(docRef, updateData, { merge: true });
      
      // Atualizar cache local
      this.characterData[moduleName] = moduleData;
      
      console.log(`✅✅✅ ${moduleName} SALVO COM SUCESSO!`);
      console.log('   Documento:', this.characterId);
      console.log('   Collection: personagens');
      
      // Disparar evento
      this.dispatchEvent('firebase-saved', { module: moduleName, data: moduleData });
      
      return true;
      
    } catch (error) {
      console.error(`❌❌❌ ERRO AO SALVAR ${moduleName}:`, error);
      console.error('   Código:', error.code);
      console.error('   Mensagem:', error.message);
      
      return false;
    }
  }

  // ===========================================
  // FUNÇÕES AUXILIARES
  // ===========================================

  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { 
      detail: { ...detail, characterId: this.characterId }
    });
    document.dispatchEvent(event);
  }

  getCharacterId() {
    return this.characterId;
  }

  getCharacterData() {
    return this.characterData;
  }

  // Para dashboard salvar pontos
  async savePoints(pointsData) {
    return this.saveModule('pontos', pointsData);
  }
}

// ===========================================
// INSTÂNCIA GLOBAL
// ===========================================

const firebaseService = new FirebaseService();
export default firebaseService;

// Exportar para window também
if (typeof window !== 'undefined') {
  window.firebaseService = firebaseService;
}