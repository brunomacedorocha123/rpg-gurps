// caracteristicas-aparencia.js - VERSÃO COMPLETA
class SistemaAparencia {
    constructor() {
        console.log('🎭 SistemaAparencia criado');
        this.niveisAparencia = {
            "-24": { 
                nome: "Horrendo", 
                pontos: -24, 
                tipo: "desvantagem", 
                icone: "fas fa-frown",
                desc: "Indescritivelmente monstruoso ou repugnante",
                reacao: "-6"
            },
            "-20": { 
                nome: "Monstruoso", 
                pontos: -20, 
                tipo: "desvantagem", 
                icone: "fas fa-ghost",
                desc: "Horrível e obviamente anormal",
                reacao: "-5"
            },
            "-16": { 
                nome: "Hediondo", 
                pontos: -16, 
                tipo: "desvantagem", 
                icone: "fas fa-meh-rolling-eyes",
                desc: "Característica repugnante na aparência",
                reacao: "-4"
            },
            "-8": { 
                nome: "Feio", 
                pontos: -8, 
                tipo: "desvantagem", 
                icone: "fas fa-meh",
                desc: "Cabelo seboso, dentes tortos, etc.",
                reacao: "-2"
            },
            "-4": { 
                nome: "Sem Atrativos", 
                pontos: -4, 
                tipo: "desvantagem", 
                icone: "fas fa-meh-blank",
                desc: "Algo antipático, mas não específico",
                reacao: "-1"
            },
            "0": { 
                nome: "Comum", 
                pontos: 0, 
                tipo: "neutro", 
                icone: "fas fa-user",
                desc: "Aparência padrão, sem modificadores",
                reacao: "+0"
            },
            "4": { 
                nome: "Atraente", 
                pontos: 4, 
                tipo: "vantagem", 
                icone: "fas fa-smile",
                desc: "Boa aparência, +1 em testes de reação",
                reacao: "+1"
            },
            "12": { 
                nome: "Elegante", 
                pontos: 12, 
                tipo: "vantagem", 
                icone: "fas fa-grin-stars",
                desc: "Poderia entrar em concursos de beleza",
                reacao: "+3"
            },
            "16": { 
                nome: "Muito Elegante", 
                pontos: 16, 
                tipo: "vantagem", 
                icone: "fas fa-crown",
                desc: "Poderia vencer concursos de beleza",
                reacao: "+4"
            },
            "20": { 
                nome: "Lindo", 
                pontos: 20, 
                tipo: "vantagem", 
                icone: "fas fa-star",
                desc: "Espécime ideal, aparência divina",
                reacao: "+5"
            }
        };
        
        this.pontosAparencia = 0;
        this.nivelAparencia = "Comum";
        this.inicializado = false;
    }

    inicializar() {
        if (this.inicializado) return;
        console.log('🚀 Inicializando SistemaAparencia...');
        
        // 1. CONFIGURAR SELECT DE APARÊNCIA
        const selectAparencia = document.getElementById('nivelAparencia');
        if (selectAparencia) {
            // Configurar evento de mudança
            selectAparencia.addEventListener('change', (e) => {
                this.atualizarAparencia(e.target.value);
            });
            
            // Configurar valor inicial
            this.atualizarAparencia(selectAparencia.value);
        }
        
        this.inicializado = true;
        console.log('✅ SistemaAparencia inicializado!');
    }

    atualizarAparencia(valor) {
        const nivel = this.niveisAparencia[valor];
        if (!nivel) return;
        
        // Atualizar valores internos
        this.pontosAparencia = nivel.pontos;
        this.nivelAparencia = nivel.nome;
        
        // 1. Atualizar badge da seção
        this.atualizarBadge('pontosAparencia', this.pontosAparencia);
        
        // 2. Atualizar display da aparência
        this.atualizarDisplayAparencia(nivel);
        
        // 3. Atualizar card de resumo (se existir)
        this.atualizarCardAparencia(nivel);
        
        // 4. Atualizar total geral
        this.atualizarTotalGeral();
    }

    atualizarBadge(id, pontos) {
        const badge = document.getElementById(id);
        if (!badge) return;
        
        badge.textContent = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
        badge.style.background = pontos >= 0 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)';
        badge.style.borderColor = pontos >= 0 ? '#2ecc71' : '#e74c3c';
        badge.style.color = pontos >= 0 ? '#2ecc71' : '#e74c3c';
    }

    atualizarDisplayAparencia(nivel) {
        const display = document.getElementById('displayAparencia');
        if (!display) return;
        
        const cor = this.getCorPorPontos(nivel.pontos);
        
        display.innerHTML = `
            <div class="display-header">
                <i class="${nivel.icone}" style="color: ${cor}"></i>
                <div>
                    <strong>${nivel.nome}</strong>
                    <small>Reação: ${nivel.reacao}</small>
                </div>
            </div>
            <p class="display-desc">${nivel.desc}</p>
        `;
    }

    atualizarCardAparencia(nivel) {
        // Procura por qualquer card que mostre informações de aparência
        // Pode ser um card específico ou parte de um resumo geral
        
        // Exemplo 1: Atualizar em um card específico de aparência
        const cardAparencia = document.getElementById('cardAparencia');
        if (cardAparencia) {
            const nivelSpan = cardAparencia.querySelector('#aparenciaNivel');
            const custoSpan = cardAparencia.querySelector('#aparenciaCusto');
            
            if (nivelSpan) nivelSpan.textContent = nivel.nome;
            if (custoSpan) {
                custoSpan.textContent = nivel.pontos >= 0 ? `+${nivel.pontos} pts` : `${nivel.pontos} pts`;
                custoSpan.style.color = nivel.pontos >= 0 ? '#2ecc71' : '#e74c3c';
            }
        }
        
        // Exemplo 2: Atualizar no resumo geral (se houver uma lista)
        const listaCaracteristicas = document.getElementById('listaCaracteristicas');
        if (listaCaracteristicas) {
            // Verifica se já existe um item para aparência
            let itemAparencia = listaCaracteristicas.querySelector('[data-tipo="aparencia"]');
            
            if (!itemAparencia) {
                // Cria novo item
                itemAparencia = document.createElement('div');
                itemAparencia.className = 'caracteristica-resumo';
                itemAparencia.setAttribute('data-tipo', 'aparencia');
                itemAparencia.innerHTML = `
                    <div class="caracteristica-nome">
                        <i class="${nivel.icone}"></i>
                        <span>Aparência: ${nivel.nome}</span>
                    </div>
                    <div class="caracteristica-pontos ${nivel.pontos >= 0 ? 'positivo' : 'negativo'}">
                        ${nivel.pontos >= 0 ? '+' : ''}${nivel.pontos} pts
                    </div>
                `;
                listaCaracteristicas.appendChild(itemAparencia);
            } else {
                // Atualiza item existente
                const icone = itemAparencia.querySelector('i');
                const nome = itemAparencia.querySelector('.caracteristica-nome span');
                const pontos = itemAparencia.querySelector('.caracteristica-pontos');
                
                if (icone) icone.className = nivel.icone;
                if (nome) nome.textContent = `Aparência: ${nivel.nome}`;
                if (pontos) {
                    pontos.textContent = nivel.pontos >= 0 ? `+${nivel.pontos} pts` : `${nivel.pontos} pts`;
                    pontos.className = `caracteristica-pontos ${nivel.pontos >= 0 ? 'positivo' : 'negativo'}`;
                }
            }
        }
    }

    atualizarTotalGeral() {
        // 1. Encontrar onde está o total de pontos da aba
        const totalAba = document.getElementById('totalPontosCaracteristicas');
        if (totalAba) {
            const totalAtual = this.getTotalAbaCaracteristicas();
            totalAba.textContent = totalAtual >= 0 ? `+${totalAtual} pts` : `${totalAtual} pts`;
            totalAba.style.color = totalAtual >= 0 ? '#2ecc71' : '#e74c3c';
        }
        
        // 2. Disparar evento para atualizar o dashboard principal
        const evento = new CustomEvent('pontosAtualizados', {
            detail: {
                tipo: 'aparencia',
                pontos: this.pontosAparencia,
                nivel: this.nivelAparencia
            }
        });
        document.dispatchEvent(evento);
    }

    getTotalAbaCaracteristicas() {
        // Se houver outras características na aba, some tudo
        let total = this.pontosAparencia;
        
        // Adicionar riqueza (se já existir no sistema)
        const sistemaRiqueza = window.sistemaRiqueza;
        if (sistemaRiqueza && sistemaRiqueza.getTotalPontos) {
            total += sistemaRiqueza.getTotalPontos();
        }
        
        // Adicionar idiomas (se já existir no sistema)
        const sistemaIdiomas = window.sistemaIdiomas;
        if (sistemaIdiomas && sistemaIdiomas.getTotalPontos) {
            total += sistemaIdiomas.getTotalPontos();
        }
        
        return total;
    }

    getCorPorPontos(pontos) {
        if (pontos > 0) return '#2ecc71';  // Verde
        if (pontos < 0) return '#e74c3c';  // Vermelho
        return '#3498db';  // Azul
    }

    // ================ GETTERS ================
    getPontos() {
        return this.pontosAparencia;
    }

    getNivel() {
        return this.nivelAparencia;
    }

    getDetalhes() {
        const nivel = this.niveisAparencia[this.pontosAparencia];
        return {
            nome: this.nivelAparencia,
            pontos: this.pontosAparencia,
            icone: nivel?.icone || 'fas fa-user',
            desc: nivel?.desc || '',
            reacao: nivel?.reacao || '+0'
        };
    }
}

// ================ INICIALIZAÇÃO ================
(function() {
    console.log('📁 Carregando SistemaAparencia...');
    
    // Criar instância global
    window.sistemaAparencia = new SistemaAparencia();
    
    // Inicializar quando a aba for carregada
    document.addEventListener('DOMContentLoaded', () => {
        // Verificar se a aba de características está visível
        const tabCaracteristicas = document.getElementById('caracteristicas');
        if (tabCaracteristicas && tabCaracteristicas.classList.contains('active')) {
            window.sistemaAparencia.inicializar();
        }
    });
    
    // Inicializar quando clicar na aba
    const tabBtn = document.querySelector('[data-tab="caracteristicas"]');
    if (tabBtn) {
        tabBtn.addEventListener('click', () => {
            if (!window.sistemaAparencia.inicializado) {
                setTimeout(() => window.sistemaAparencia.inicializar(), 300);
            }
        });
    }
    
    // Inicializar automaticamente após um tempo
    setTimeout(() => {
        if (!window.sistemaAparencia.inicializado) {
            window.sistemaAparencia.inicializar();
        }
    }, 2000);
})();

console.log('🎭 SistemaAparencia carregado!');