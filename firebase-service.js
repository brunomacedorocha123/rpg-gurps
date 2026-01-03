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
    
    // Iniciar automaticamente
    this.init();
  }

  async init() {
    return new Promise((resolve) => {
      // Verificar se já está logado
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userId = user.uid;
          console.log('✅ Usuário Firebase:', this.userId);
          resolve(true);
        } else {
          // Login anônimo automático
          try {
            const result = await signInAnonymously(auth);
            this.userId = result.user.uid;
            console.log('✅ Novo usuário anônimo:', this.userId);
            resolve(true);
          } catch (error) {
            console.error('❌ Erro de autenticação:', error);
            resolve(false);
          }
        }
      });
    });
  }

  // SALVAR todo o personagem
  async saveFullCharacter(nomePersonagem, dadosCompletos) {
    try {
      await this.init(); // Garantir que está autenticado
      
      // Criar ID único se for novo personagem
      if (!this.characterId) {
        this.characterId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Preparar dados
      const characterData = {
        ...dadosCompletos,
        userId: this.userId,
        nome: nomePersonagem || `Personagem ${new Date().toLocaleDateString()}`,
        atualizadoEm: serverTimestamp(),
        criadoEm: serverTimestamp()
      };
      
      // SALVAR no Firebase (cria coleção automaticamente)
      const docRef = doc(db, "personagens", this.characterId);
      await setDoc(docRef, characterData);
      
      console.log('💾 Personagem salvo no Firebase:', this.characterId);
      return this.characterId;
      
    } catch (error) {
      console.error('❌ Erro ao salvar personagem:', error);
      throw error;
    }
  }

  // SALVAR um módulo específico (atributos, vantagens, etc.)
  async saveModule(moduleName, moduleData) {
    try {
      if (!this.characterId) {
        console.warn('⚠️ Nenhum personagem selecionado. Criando novo...');
        await this.saveFullCharacter("Personagem Sem Nome", { [moduleName]: moduleData });
        return;
      }
      
      const docRef = doc(db, "personagens", this.characterId);
      await updateDoc(docRef, {
        [moduleName]: moduleData,
        atualizadoEm: serverTimestamp()
      });
      
      console.log(`💾 Módulo "${moduleName}" salvo`);
      
    } catch (error) {
      console.error(`❌ Erro ao salvar módulo ${moduleName}:`, error);
      throw error;
    }
  }

  // CARREGAR personagem por ID
  async loadCharacter(characterId) {
    try {
      this.characterId = characterId;
      const docRef = doc(db, "personagens", characterId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.characterData = docSnap.data();
        console.log('📂 Personagem carregado:', this.characterData);
        return this.characterData;
      } else {
        throw new Error('Personagem não encontrado');
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar:', error);
      throw error;
    }
  }

  // ESCUTAR mudanças em tempo real (para dashboard)
  subscribeToCharacter(callback) {
    if (!this.characterId) return null;
    
    const docRef = doc(db, "personagens", this.characterId);
    
    // Cancelar inscrição anterior se existir
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    // Escutar em tempo real
    this.unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.characterData = data;
        callback(data);
      }
    });
    
    return this.unsubscribe;
  }

  // SALVAR apenas pontos para dashboard
  async savePoints(pointsData) {
    if (!this.characterId) return;
    
    try {
      const docRef = doc(db, "personagens", this.characterId);
      await updateDoc(docRef, {
        'pontos': pointsData,
        'atualizadoEm': serverTimestamp()
      });
      console.log('📊 Pontos salvos para dashboard');
    } catch (error) {
      console.error('❌ Erro ao salvar pontos:', error);
    }
  }

  // OBTER lista de personagens do usuário
  async getMyCharacters() {
    // Implementação simplificada
    // Na prática, você precisaria de uma query
    return [this.characterId]; // Retorna IDs dos personagens
  }

  // LIMPAR tudo (para testes)
  clear() {
    this.characterId = null;
    this.characterData = {};
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

// Criar UMA instância global
const firebaseService = new FirebaseService();

// Exportar a instância única
export default firebaseService;