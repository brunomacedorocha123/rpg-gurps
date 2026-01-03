// js/pontos-manager.js
import firebaseService from './firebase-service.js';

class PontosManager {
    constructor() {
        this.pontosPorAba = {
            atributos: 0,
            aparência: 0,
            riqueza: 0,
            idiomas: 0,
            características_físicas: 0,
            vantagens: 0,
            desvantagens: 0,
            relacionamentos: 0,
            peculiaridades: 0,
            técnicas: 0,
            magias: 0,
            perícias: 0
        };
        
        this.totalPontos = 0;
        this.limitePontos = 150; // Limite do GURPS
        this.listeners = [];
    }
    
    // Cada aba reporta seus pontos
    atualizarPontosAba(nomeAba, pontos) {
        console.log(`📊 ${nomeAba}: ${pontos} pontos`);
        
        this.pontosPorAba[nomeAba] = pontos;
        this.calcularTotal();
        this.salvarNoFirebase();
        this.notificarListeners();
    }
    
    calcularTotal() {
        this.totalPontos = Object.values(this.pontosPorAba).reduce((a, b) => a + b, 0);
        
        // Verificar limite
        if (this.totalPontos > this.limitePontos) {
            console.warn(`⚠️ EXCEDEU LIMITE! Total: ${this.totalPontos}/${this.limitePontos}`);
        }
        
        return this.totalPontos;
    }
    
    async salvarNoFirebase() {
        try {
            const dadosPontos = {
                total: this.totalPontos,
                distribuicao: { ...this.pontosPorAba },
                limite: this.limitePontos,
                ultimaAtualizacao: new Date().toISOString(),
                status: this.totalPontos > this.limitePontos ? 'excedido' : 
                       this.totalPontos === this.limitePontos ? 'perfeito' : 'disponivel'
            };
            
            // Salvar no Firebase (módulo "pontos")
            await firebaseService.saveModule('pontos', dadosPontos);
            
            console.log('💾 Pontos salvos no Firebase:', dadosPontos);
            
        } catch (error) {
            console.error('❌ Erro ao salvar pontos:', error);
        }
    }
    
    // Para dashboard escutar mudanças
    adicionarListener(callback) {
        this.listeners.push(callback);
    }
    
    notificarListeners() {
        const dados = {
            total: this.totalPontos,
            distribuicao: { ...this.pontosPorAba },
            limite: this.limitePontos,
            disponivel: this.limitePontos - this.totalPontos
        };
        
        this.listeners.forEach(callback => callback(dados));
    }
    
    // Carregar pontos salvos
    async carregarPontos() {
        try {
            // Se já temos dados do personagem carregados
            if (firebaseService.characterData?.pontos) {
                const pontosSalvos = firebaseService.characterData.pontos;
                
                this.pontosPorAba = pontosSalvos.distribuicao || this.pontosPorAba;
                this.totalPontos = pontosSalvos.total || 0;
                
                console.log('📂 Pontos carregados do Firebase:', pontosSalvos);
                this.notificarListeners();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar pontos:', error);
        }
    }
    
    // Obter resumo para display
    getResumo() {
        const disponivel = this.limitePontos - this.totalPontos;
        
        return {
            total: this.totalPontos,
            disponivel: disponivel,
            limite: this.limitePontos,
            status: this.totalPontos > this.limitePontos ? 'excedido' : 
                   this.totalPontos === this.limitePontos ? 'perfeito' : 'normal',
            distribuicao: this.getDistribuicaoFormatada()
        };
    }
    
    getDistribuicaoFormatada() {
        return Object.entries(this.pontosPorAba)
            .filter(([aba, pontos]) => pontos !== 0)
            .map(([aba, pontos]) => ({
                aba: aba.replace('_', ' '),
                pontos: pontos,
                percentual: ((pontos / this.totalPontos) * 100).toFixed(1) + '%'
            }));
    }
}

// Criar instância global
const pontosManager = new PontosManager();

// Exportar
export default pontosManager;