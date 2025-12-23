// caracteristicas-aparencia.js - VERSÃO SIMPLIFICADA QUE FUNCIONA
class SistemaAparencia {
  constructor() {
    console.log('🎭 SistemaAparencia criado');
    this.niveisAparencia = {
      "-24": { nome: "Horrendo", reacao: -6, tipo: "desvantagem", icone: "fas fa-frown" },
      "-20": { nome: "Monstruoso", reacao: -5, tipo: "desvantagem", icone: "fas fa-ghost" },
      "-16": { nome: "Hediondo", reacao: -4, tipo: "desvantagem", icone: "fas fa-meh-rolling-eyes" },
      "-8": { nome: "Feio", reacao: -2, tipo: "desvantagem", icone: "fas fa-meh" },
      "-4": { nome: "Sem Atrativos", reacao: -1, tipo: "desvantagem", icone: "fas fa-meh-blank" },
      "0": { nome: "Comum", reacao: 0, tipo: "neutro", icone: "fas fa-user" },
      "4": { nome: "Atraente", reacao: 1, tipo: "vantagem", icone: "fas fa-smile" },
      "12": { nome: "Elegante", reacao: { mesmoSexo: 2, outroSexo: 4 }, tipo: "vantagem", icone: "fas fa-grin-stars" },
      "16": { nome: "Muito Elegante", reacao: { mesmoSexo: 2, outroSexo: 6 }, tipo: "vantagem", icone: "fas fa-crown" },
      "20": { nome: "Lindo", reacao: { mesmoSexo: 2, outroSexo: 8 }, tipo: "vantagem", icone: "fas fa-star" }
    };
    this.pontosAtuais = 0;
    this.inicializado = false;
  }

  inicializar() {
    if (this.inicializado) return;
    console.log('🚀 Inicializando SistemaAparencia...');
    
    // 1. VERIFICAR ELEMENTOS RÁPIDO
    const select = document.getElementById('nivelAparencia');
    if (!select) {
      console.error('❌ #nivelAparencia não encontrado!');
      return;
    }
    
    // 2. CONFIGURAR EVENTO SIMPLES
    select.addEventListener('change', (e) => {
      this.atualizarAparencia(parseInt(e.target.value));
    });
    
    // 3. CONFIGURAR INICIAL
    const valorInicial = parseInt(select.value) || 0;
    this.atualizarAparencia(valorInicial);
    
    this.inicializado = true;
    console.log('✅ SistemaAparencia pronto!');
  }

  atualizarAparencia(pontos) {
    const nivel = this.niveisAparencia[pontos];
    if (!nivel) return;
    
    this.pontosAtuais = pontos;
    
    // ATUALIZAR BADGE
    const badge = document.getElementById('pontosAparencia');
    if (badge) {
      badge.textContent = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
      
      // CORES SIMPLES
      if (pontos > 0) {
        badge.style.background = 'rgba(46, 204, 113, 0.2)';
        badge.style.borderColor = '#2ecc71';
      } else if (pontos < 0) {
        badge.style.background = 'rgba(231, 76, 60, 0.2)';
        badge.style.borderColor = '#e74c3c';
      } else {
        badge.style.background = 'rgba(52, 152, 219, 0.2)';
        badge.style.borderColor = '#3498db';
      }
    }
    
    // ATUALIZAR DISPLAY
    const display = document.getElementById('displayAparencia');
    if (display) {
      display.innerHTML = `
        <div class="display-header">
          <i class="${nivel.icone}" style="color: ${this.getCorTipo(nivel.tipo)}"></i>
          <div>
            <strong>${nivel.nome}</strong>
            <small>${this.getTextoReacao(nivel.reacao)}</small>
          </div>
        </div>
        <p class="display-desc">${this.getDescricao(nivel)}</p>
      `;
    }
    
    // NOTIFICAR DASHBOARD
    this.notificarDashboard();
  }

  getCorTipo(tipo) {
    switch(tipo) {
      case 'vantagem': return '#2ecc71';
      case 'desvantagem': return '#e74c3c';
      default: return '#3498db';
    }
  }

  getTextoReacao(reacao) {
    if (typeof reacao === 'object') {
      return `Reação: +${reacao.outroSexo} (outro sexo), +${reacao.mesmoSexo} (mesmo sexo)`;
    }
    return `Reação: ${reacao >= 0 ? '+' : ''}${reacao}`;
  }

  getDescricao(nivel) {
    const descricoes = {
      "-24": "Indescritivelmente monstruoso ou repugnante",
      "-20": "Horrível e obviamente anormal", 
      "-16": "Característica repugnante na aparência",
      "-8": "Cabelo seboso, dentes tortos, etc.",
      "-4": "Algo antipático, mas não específico",
      "0": "Aparência padrão, sem modificadores",
      "4": "Boa aparência, +1 em testes de reação",
      "12": "Poderia entrar em concursos de beleza",
      "16": "Poderia vencer concursos de beleza",
      "20": "Espécime ideal, aparência divina"
    };
    return descricoes[this.pontosAtuais] || nivel.nome;
  }

  notificarDashboard() {
    // Disparar evento para o dashboard
    const evento = new CustomEvent('aparenciaAtualizada', {
      detail: { pontos: this.pontosAtuais }
    });
    document.dispatchEvent(evento);
  }

  // GETTERS SIMPLES
  getPontos() { return this.pontosAtuais; }
  
  getInfo() {
    const nivel = this.niveisAparencia[this.pontosAtuais];
    return nivel ? {
      pontos: this.pontosAtuais,
      nome: nivel.nome,
      tipo: nivel.tipo,
      reacao: nivel.reacao
    } : null;
  }
}

// ================ INICIALIZAÇÃO SIMPLES ================
(function() {
  console.log('📁 Carregando SistemaAparencia...');
  
  // Criar instância global
  window.sistemaAparencia = new SistemaAparencia();
  
  // Inicializar quando a tab características for clicada
  document.addEventListener('click', function(e) {
    const tabBtn = e.target.closest('[data-tab="caracteristicas"]');
    if (tabBtn && !window.sistemaAparencia.inicializado) {
      setTimeout(() => window.sistemaAparencia.inicializar(), 300);
    }
  });
  
  // Tentar inicializar após 2 segundos (fallback)
  setTimeout(() => {
    if (!window.sistemaAparencia.inicializado) {
      window.sistemaAparencia.inicializar();
    }
  }, 2000);
})();

console.log('🎭 SistemaAparencia carregado!');