// caracteristicas-aparencia.js - VERSÃO CORRIGIDA
class SistemaAparencia {
  constructor() {
    this.niveisAparencia = {
      "-24": { nome: "Horrendo", reacao: -6, descricao: "Indescritivelmente monstruoso ou repugnante", icone: "fas fa-frown", tipo: "desvantagem" },
      "-20": { nome: "Monstruoso", reacao: -5, descricao: "Horrível e obviamente anormal", icone: "fas fa-ghost", tipo: "desvantagem" },
      "-16": { nome: "Hediondo", reacao: -4, descricao: "Característica repugnante na aparência", icone: "fas fa-meh-rolling-eyes", tipo: "desvantagem" },
      "-8": { nome: "Feio", reacao: -2, descricao: "Cabelo seboso, dentes tortos, etc.", icone: "fas fa-meh", tipo: "desvantagem" },
      "-4": { nome: "Sem Atrativos", reacao: -1, descricao: "Algo antipático, mas não específico", icone: "fas fa-meh-blank", tipo: "desvantagem" },
      "0": { nome: "Comum", reacao: 0, descricao: "Aparência padrão, sem modificadores", icone: "fas fa-user", tipo: "neutro" },
      "4": { nome: "Atraente", reacao: 1, descricao: "Boa aparência, +1 em testes de reação", icone: "fas fa-smile", tipo: "vantagem" },
      "12": { nome: "Elegante", reacao: { mesmoSexo: 2, outroSexo: 4 }, descricao: "Poderia entrar em concursos de beleza", icone: "fas fa-grin-stars", tipo: "vantagem" },
      "16": { nome: "Muito Elegante", reacao: { mesmoSexo: 2, outroSexo: 6 }, descricao: "Poderia vencer concursos de beleza", icone: "fas fa-crown", tipo: "vantagem" },
      "20": { nome: "Lindo", reacao: { mesmoSexo: 2, outroSexo: 8 }, descricao: "Espécime ideal, aparência divina", icone: "fas fa-star", tipo: "vantagem" }
    };

    this.inicializado = false;
    this.pontosAtuais = 0;
  }

  inicializar() {
    if (this.inicializado) {
      console.log('SistemaAparencia já inicializado');
      return;
    }
    
    console.log('Inicializando SistemaAparencia...');
    
    // Verificar se os elementos existem
    const select = document.getElementById('nivelAparencia');
    const display = document.getElementById('displayAparencia');
    const badge = document.getElementById('pontosAparencia');
    
    if (!select) {
      console.error('Elemento #nivelAparencia não encontrado!');
      return;
    }
    
    if (!display) {
      console.error('Elemento #displayAparencia não encontrado!');
      return;
    }
    
    if (!badge) {
      console.error('Elemento #pontosAparencia não encontrado!');
      return;
    }
    
    console.log('Elementos encontrados. Configurando eventos...');
    
    // Configurar evento de mudança
    select.addEventListener('change', (e) => {
      console.log('Select mudou para:', e.target.value);
      this.atualizarAparencia(parseInt(e.target.value));
    });
    
    // Configurar evento de input para atualização em tempo real
    select.addEventListener('input', (e) => {
      this.atualizarAparencia(parseInt(e.target.value));
    });
    
    // Atualizar estado inicial
    const valorInicial = parseInt(select.value) || 0;
    console.log('Valor inicial do select:', valorInicial);
    this.atualizarAparencia(valorInicial);
    
    // Marcar como inicializado
    this.inicializado = true;
    console.log('SistemaAparencia inicializado com sucesso!');
  }

  atualizarAparencia(pontos) {
    console.log('Atualizando aparência com pontos:', pontos);
    
    const nivel = this.niveisAparencia[pontos.toString()];
    if (!nivel) {
      console.error('Nível não encontrado para pontos:', pontos);
      return;
    }
    
    this.pontosAtuais = pontos;
    
    // Atualizar badge de pontos
    this.atualizarBadgePontos(pontos, nivel.tipo);
    
    // Atualizar display
    this.atualizarDisplay(nivel);
    
    // Notificar sistema de pontos
    this.notificarSistemaPontos();
  }

  atualizarBadgePontos(pontos, tipo) {
    const badge = document.getElementById('pontosAparencia');
    if (!badge) return;
    
    // Formatar texto dos pontos
    const pontosTexto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
    badge.textContent = pontosTexto;
    
    // Estilizar conforme tipo
    switch(tipo) {
      case 'vantagem':
        badge.style.background = 'linear-gradient(145deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.3))';
        badge.style.borderColor = '#2ecc71';
        badge.style.color = '#2ecc71';
        break;
      case 'desvantagem':
        badge.style.background = 'linear-gradient(145deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.3))';
        badge.style.borderColor = '#e74c3c';
        badge.style.color = '#e74c3c';
        break;
      default:
        badge.style.background = 'linear-gradient(145deg, rgba(52, 152, 219, 0.2), rgba(41, 128, 185, 0.3))';
        badge.style.borderColor = '#3498db';
        badge.style.color = '#3498db';
    }
    
    // Animação
    badge.style.transform = 'scale(1.1)';
    setTimeout(() => {
      badge.style.transform = 'scale(1)';
    }, 200);
  }

  atualizarDisplay(nivel) {
    const display = document.getElementById('displayAparencia');
    if (!display) return;
    
    // Criar texto de reação
    let textoReacao = '';
    if (typeof nivel.reacao === 'object') {
      textoReacao = `Reação: +${nivel.reacao.outroSexo} (outro sexo), +${nivel.reacao.mesmoSexo} (mesmo sexo)`;
    } else {
      textoReacao = `Reação: ${nivel.reacao >= 0 ? '+' : ''}${nivel.reacao}`;
    }
    
    // Atualizar conteúdo do display
    const displayHeader = display.querySelector('.display-header');
    const displayDesc = display.querySelector('.display-desc');
    
    if (displayHeader) {
      displayHeader.innerHTML = `
        <i class="${nivel.icone}"></i>
        <div>
          <strong>${nivel.nome}</strong>
          <small>${textoReacao}</small>
        </div>
      `;
      
      // Cor do ícone conforme tipo
      const icon = displayHeader.querySelector('i');
      if (icon) {
        switch(nivel.tipo) {
          case 'vantagem': icon.style.color = '#2ecc71'; break;
          case 'desvantagem': icon.style.color = '#e74c3c'; break;
          default: icon.style.color = '#3498db';
        }
      }
    }
    
    if (displayDesc) {
      displayDesc.textContent = nivel.descricao;
    }
  }

  notificarSistemaPontos() {
    const evento = new CustomEvent('aparenciaAtualizada', {
      detail: {
        pontos: this.pontosAtuais,
        tipo: this.niveisAparencia[this.pontosAtuais.toString()]?.tipo || 'neutro',
        nome: this.niveisAparencia[this.pontosAtuais.toString()]?.nome || 'Desconhecido',
        timestamp: new Date().toISOString()
      }
    });
    
    document.dispatchEvent(evento);
    console.log('Evento disparado: aparência atualizada', evento.detail);
  }

  // Métodos públicos
  getPontos() {
    return this.pontosAtuais;
  }

  getInfo() {
    const nivel = this.niveisAparencia[this.pontosAtuais.toString()];
    return {
      pontos: this.pontosAtuais,
      nome: nivel?.nome || 'Desconhecido',
      tipo: nivel?.tipo || 'neutro',
      descricao: nivel?.descricao || '',
      reacao: nivel?.reacao || 0
    };
  }

  // Para debug
  testarFuncionamento() {
    console.log('=== TESTE SISTEMA APARÊNCIA ===');
    console.log('Select existe:', !!document.getElementById('nivelAparencia'));
    console.log('Display existe:', !!document.getElementById('displayAparencia'));
    console.log('Badge existe:', !!document.getElementById('pontosAparencia'));
    console.log('Valor atual do select:', document.getElementById('nivelAparencia')?.value);
    console.log('Pontos atuais:', this.pontosAtuais);
    console.log('==============================');
  }
}

// Inicialização automática quando a aba estiver pronta
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM carregado, verificando aba de características...');
  
  // Esperar um pouco para garantir que o HTML foi renderizado
  setTimeout(() => {
    const tabCaracteristicas = document.getElementById('caracteristicas');
    if (tabCaracteristicas) {
      console.log('Aba características encontrada, inicializando sistema...');
      
      // Criar instância
      window.sistemaAparencia = new SistemaAparencia();
      
      // Inicializar
      window.sistemaAparencia.inicializar();
      
      // Testar funcionamento
      window.sistemaAparencia.testarFuncionamento();
      
      // Expor para debug
      console.log('SistemaAparencia disponível como window.sistemaAparencia');
    } else {
      console.warn('Aba características não encontrada. Tentando inicializar de qualquer forma...');
      
      // Tentar inicializar mesmo assim (pode ser carregamento dinâmico)
      window.sistemaAparencia = new SistemaAparencia();
      setTimeout(() => {
        window.sistemaAparencia.inicializar();
      }, 500);
    }
  }, 100);
});

// Listener para quando a aba for ativada (se você tem sistema de tabs)
document.addEventListener('tabAtivada', function(e) {
  if (e.detail && e.detail.tabId === 'caracteristicas') {
    console.log('Aba características ativada, inicializando sistema...');
    
    if (!window.sistemaAparencia) {
      window.sistemaAparencia = new SistemaAparencia();
    }
    
    window.sistemaAparencia.inicializar();
  }
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SistemaAparencia;
}