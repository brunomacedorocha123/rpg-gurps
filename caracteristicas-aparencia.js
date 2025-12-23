// caracteristicas-aparencia.js
class SistemaAparencia {
  constructor() {
    this.niveisAparencia = {
      "horrendo": {
        pontos: -24,
        reacao: -6,
        descricao: "Indescritivelmente monstruoso ou repugnante",
        icone: "fas fa-frown",
        tipo: "desvantagem",
        cor: "#e74c3c"
      },
      "monstruoso": {
        pontos: -20,
        reacao: -5,
        descricao: "Horrível e obviamente anormal",
        icone: "fas fa-ghost",
        tipo: "desvantagem",
        cor: "#c0392b"
      },
      "hediondo": {
        pontos: -16,
        reacao: -4,
        descricao: "Característica repugnante na aparência",
        icone: "fas fa-meh-rolling-eyes",
        tipo: "desvantagem",
        cor: "#d35400"
      },
      "feio": {
        pontos: -8,
        reacao: -2,
        descricao: "Cabelo seboso, dentes tortos, etc.",
        icone: "fas fa-meh",
        tipo: "desvantagem",
        cor: "#e67e22"
      },
      "sem-atrativos": {
        pontos: -4,
        reacao: -1,
        descricao: "Algo antipático, mas não específico",
        icone: "fas fa-meh-blank",
        tipo: "desvantagem",
        cor: "#f39c12"
      },
      "comum": {
        pontos: 0,
        reacao: 0,
        descricao: "Aparência padrão, sem modificadores",
        icone: "fas fa-user",
        tipo: "neutro",
        cor: "#3498db"
      },
      "atraente": {
        pontos: 4,
        reacao: 1,
        descricao: "Boa aparência, +1 em testes de reação",
        icone: "fas fa-smile",
        tipo: "vantagem",
        cor: "#2ecc71"
      },
      "elegante": {
        pontos: 12,
        reacao: { mesmoSexo: 2, outroSexo: 4 },
        descricao: "Poderia entrar em concursos de beleza",
        icone: "fas fa-grin-stars",
        tipo: "vantagem",
        cor: "#1abc9c"
      },
      "muito-elegante": {
        pontos: 16,
        reacao: { mesmoSexo: 2, outroSexo: 6 },
        descricao: "Poderia vencer concursos de beleza",
        icone: "fas fa-crown",
        tipo: "vantagem",
        cor: "#9b59b6"
      },
      "lindo": {
        pontos: 20,
        reacao: { mesmoSexo: 2, outroSexo: 8 },
        descricao: "Espécime ideal, aparência divina",
        icone: "fas fa-star",
        tipo: "vantagem",
        cor: "#f1c40f"
      }
    };

    this.nivelAtual = 'comum';
    this.pontosAtuais = 0;
    this.inicializado = false;
  }

  inicializar() {
    if (this.inicializado) return;
    
    this.configurarEventos();
    this.atualizarDisplayAparencia();
    this.inicializado = true;
    this.notificarSistemaPontos();
    
    console.log('SistemaAparencia inicializado com sucesso!');
  }

  configurarEventos() {
    const selectAparencia = document.getElementById('nivelAparencia');
    if (selectAparencia) {
      selectAparencia.addEventListener('change', (e) => {
        this.nivelAtual = this.obterNomePorPontos(parseInt(e.target.value));
        this.pontosAtuais = parseInt(e.target.value);
        this.atualizarDisplayAparencia();
        this.notificarSistemaPontos();
        this.animarMudanca();
      });
    }
  }

  atualizarDisplayAparencia() {
    const select = document.getElementById('nivelAparencia');
    const display = document.getElementById('displayAparencia');
    const badge = document.getElementById('pontosAparencia');
    
    if (!select || !display || !badge) {
      console.error('Elementos do display de aparência não encontrados!');
      return;
    }

    const valor = parseInt(select.value) || 0;
    const nivel = this.obterNivelPorPontos(valor);
    
    if (nivel) {
      let textoReacao = '';
      if (typeof nivel.reacao === 'object') {
        textoReacao = `Reação: +${nivel.reacao.outroSexo} (outro sexo), +${nivel.reacao.mesmoSexo} (mesmo sexo)`;
      } else {
        textoReacao = `Reação: ${nivel.reacao >= 0 ? '+' : ''}${nivel.reacao}`;
      }
      
      // Atualizar display com a nova estrutura HTML
      const displayHeader = display.querySelector('.display-header');
      const displayDesc = display.querySelector('.display-desc');
      
      if (displayHeader) {
        displayHeader.innerHTML = `
          <i class="${nivel.icone}" style="color: ${nivel.cor};"></i>
          <div>
            <strong>${this.obterNomePorPontos(valor)}</strong>
            <small>${textoReacao}</small>
          </div>
        `;
      }
      
      if (displayDesc) {
        displayDesc.textContent = nivel.descricao;
      }

      // Atualizar badge
      const pontosTexto = valor >= 0 ? `+${valor} pts` : `${valor} pts`;
      badge.textContent = pontosTexto;
      
      // Estilizar badge conforme tipo
      switch(nivel.tipo) {
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
    }
  }

  animarMudanca() {
    const badge = document.getElementById('pontosAparencia');
    if (badge) {
      badge.style.transform = 'scale(1.2)';
      setTimeout(() => {
        badge.style.transform = 'scale(1)';
      }, 300);
    }
  }

  getPontosAparencia() {
    const select = document.getElementById('nivelAparencia');
    return select ? parseInt(select.value) || 0 : 0;
  }

  getTipoPontos() {
    const pontos = this.getPontosAparencia();
    if (pontos > 0) return 'vantagem';
    if (pontos < 0) return 'desvantagem';
    return 'neutro';
  }

  getInfoAparencia() {
    const pontos = this.getPontosAparencia();
    const nivel = this.obterNivelPorPontos(pontos);
    const nome = this.obterNomePorPontos(pontos);
    
    return {
      pontos,
      tipo: this.getTipoPontos(),
      nome,
      descricao: nivel?.descricao || 'Desconhecido',
      reacao: nivel?.reacao || 0,
      icone: nivel?.icone || 'fas fa-user'
    };
  }

  notificarSistemaPontos() {
    const pontos = this.getPontosAparencia();
    const tipo = this.getTipoPontos();
    
    const evento = new CustomEvent('aparenciaPontosAtualizados', {
      detail: {
        pontos: pontos,
        tipo: tipo,
        nivel: this.obterNomePorPontos(pontos),
        info: this.getInfoAparencia(),
        timestamp: new Date().toISOString()
      }
    });
    
    document.dispatchEvent(evento);
    console.log('Evento aparenciaPontosAtualizados disparado:', evento.detail);
  }

  obterNivelPorPontos(pontos) {
    return Object.values(this.niveisAparencia).find(nivel => nivel.pontos === pontos);
  }

  obterNomePorPontos(pontos) {
    const entry = Object.entries(this.niveisAparencia).find(([key, nivel]) => nivel.pontos === pontos);
    return entry ? this.formatarNome(entry[0]) : 'Desconhecido';
  }

  formatarNome(key) {
    return key.split('-')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  }

  calcularReacao(sexoPersonagem, sexoAlvo) {
    const nivel = this.obterNivelPorPontos(this.getPontosAparencia());
    if (!nivel) return 0;
    
    if (typeof nivel.reacao === 'object') {
      return sexoPersonagem === sexoAlvo ? nivel.reacao.mesmoSexo : nivel.reacao.outroSexo;
    }
    
    return nivel.reacao || 0;
  }

  exportarDados() {
    return {
      aparencia: {
        pontos: this.getPontosAparencia(),
        tipo: this.getTipoPontos(),
        nome: this.obterNomePorPontos(this.getPontosAparencia()),
        descricao: this.obterNivelPorPontos(this.getPontosAparencia())?.descricao,
        nivel: this.getPontosAparencia(),
        reacao: this.obterNivelPorPontos(this.getPontosAparencia())?.reacao
      }
    };
  }

  carregarDados(dados) {
    if (dados.aparencia && dados.aparencia.nivel !== undefined) {
      const select = document.getElementById('nivelAparencia');
      if (select) {
        select.value = dados.aparencia.nivel;
        this.nivelAtual = dados.aparencia.nome;
        this.pontosAtuais = dados.aparencia.nivel;
        this.atualizarDisplayAparencia();
        this.notificarSistemaPontos();
        
        console.log('Dados de aparência carregados:', dados.aparencia);
      }
    }
  }

  validarAparencia() {
    const pontos = this.getPontosAparencia();
    const tipo = this.getTipoPontos();
    const nome = this.obterNomePorPontos(pontos);
    
    return {
      valido: true,
      pontos: pontos,
      tipo: tipo,
      nome: nome,
      mensagem: `Aparência: ${nome} (${pontos >= 0 ? '+' : ''}${pontos} pts) - ${tipo === 'vantagem' ? 'Vantagem' : tipo === 'desvantagem' ? 'Desvantagem' : 'Neutro'}`
    };
  }

  reset() {
    const select = document.getElementById('nivelAparencia');
    if (select) {
      select.value = 0;
      this.nivelAtual = 'comum';
      this.pontosAtuais = 0;
      this.atualizarDisplayAparencia();
      this.notificarSistemaPontos();
    }
  }
}

// Instância global
let sistemaAparencia;

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  sistemaAparencia = new SistemaAparencia();
  
  // Verificar se a aba de características está ativa
  const tabCaracteristicas = document.getElementById('caracteristicas');
  if (tabCaracteristicas && tabCaracteristicas.style.display !== 'none') {
    sistemaAparencia.inicializar();
  }
});

// Inicializar quando a aba for mostrada
document.addEventListener('tabAtivada', function(e) {
  if (e.detail.tabId === 'caracteristicas') {
    if (!sistemaAparencia) {
      sistemaAparencia = new SistemaAparencia();
    }
    sistemaAparencia.inicializar();
  }
});

// Listeners para eventos do sistema
document.addEventListener('caracteristicasCarregadas', function() {
  if (sistemaAparencia) {
    sistemaAparencia.inicializar();
  }
});

document.addEventListener('resetCaracteristicas', function() {
  if (sistemaAparencia) {
    sistemaAparencia.reset();
  }
});

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.SistemaAparencia = SistemaAparencia;
  window.sistemaAparencia = sistemaAparencia;
}

// Debug helper
if (process.env.NODE_ENV === 'development') {
  console.log('SistemaAparencia.js carregado');
  
  // Expor métodos de debug
  window.debugAparencia = {
    getInfo: () => sistemaAparencia?.getInfoAparencia(),
    getPontos: () => sistemaAparencia?.getPontosAparencia(),
    setNivel: (pontos) => {
      const select = document.getElementById('nivelAparencia');
      if (select && sistemaAparencia) {
        select.value = pontos;
        sistemaAparencia.nivelAtual = sistemaAparencia.obterNomePorPontos(pontos);
        sistemaAparencia.pontosAtuais = pontos;
        sistemaAparencia.atualizarDisplayAparencia();
        sistemaAparencia.notificarSistemaPontos();
      }
    }
  };
}

// Module export (se usando módulos)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SistemaAparencia;
}