// caracteristicas-aparencia.js - VERSÃO QUE CALCULA TOTAL NA ABA
class SistemaAparencia {
    constructor() {
        console.log('🎭 SistemaAparencia criado');
        this.niveisAparencia = {
            "-24": { nome: "Horrendo", pontos: -24, tipo: "desvantagem", icone: "fas fa-frown" },
            "-20": { nome: "Monstruoso", pontos: -20, tipo: "desvantagem", icone: "fas fa-ghost" },
            "-16": { nome: "Hediondo", pontos: -16, tipo: "desvantagem", icone: "fas fa-meh-rolling-eyes" },
            "-8": { nome: "Feio", pontos: -8, tipo: "desvantagem", icone: "fas fa-meh" },
            "-4": { nome: "Sem Atrativos", pontos: -4, tipo: "desvantagem", icone: "fas fa-meh-blank" },
            "0": { nome: "Comum", pontos: 0, tipo: "neutro", icone: "fas fa-user" },
            "4": { nome: "Atraente", pontos: 4, tipo: "vantagem", icone: "fas fa-smile" },
            "12": { nome: "Elegante", pontos: 12, tipo: "vantagem", icone: "fas fa-grin-stars" },
            "16": { nome: "Muito Elegante", pontos: 16, tipo: "vantagem", icone: "fas fa-crown" },
            "20": { nome: "Lindo", pontos: 20, tipo: "vantagem", icone: "fas fa-star" }
        };
        
        this.niveisRiqueza = {
            "-25": { nome: "Falido", pontos: -25, multiplicador: 0.1, renda: "$100" },
            "-15": { nome: "Pobre", pontos: -15, multiplicador: 0.2, renda: "$200" },
            "-10": { nome: "Batalhador", pontos: -10, multiplicador: 0.5, renda: "$500" },
            "0": { nome: "Médio", pontos: 0, multiplicador: 1, renda: "$1.000" },
            "10": { nome: "Confortável", pontos: 10, multiplicador: 2, renda: "$2.000" },
            "20": { nome: "Rico", pontos: 20, multiplicador: 5, renda: "$5.000" },
            "30": { nome: "Muito Rico", pontos: 30, multiplicador: 10, renda: "$10.000" },
            "50": { nome: "Podre de Rico", pontos: 50, multiplicador: 20, renda: "$20.000" }
        };
        
        this.caracteristicasFisicas = {
            "magro": { nome: "Magro", pontos: -5, desc: "Peso: 67% do normal" },
            "acima-peso": { nome: "Acima do Peso", pontos: -1, desc: "Peso: 130% do normal" },
            "gordo": { nome: "Gordo", pontos: -3, desc: "Peso: 150% do normal" },
            "muito-gordo": { nome: "Muito Gordo", pontos: -5, desc: "Peso: 200% do normal" },
            "nanismo": { nome: "Nanismo", pontos: -15, desc: "MT -1, -1 Deslocamento" },
            "gigantismo": { nome: "Gigantismo", pontos: 0, desc: "MT +1, +1 Deslocamento" }
        };
        
        this.pontosAparencia = 0;
        this.pontosRiqueza = 0;
        this.pontosIdiomas = 0;
        this.pontosCaracteristicas = 0;
        this.caracteristicasSelecionadas = [];
        this.idiomasAdicionais = [];
        
        this.inicializado = false;
    }

    inicializar() {
        if (this.inicializado) return;
        console.log('🚀 Inicializando SistemaAparencia...');
        
        // 1. APARÊNCIA
        const selectAparencia = document.getElementById('nivelAparencia');
        if (selectAparencia) {
            selectAparencia.addEventListener('change', (e) => {
                this.pontosAparencia = parseInt(e.target.value) || 0;
                this.atualizarBadge('pontosAparencia', this.pontosAparencia);
                this.atualizarDisplayAparencia();
                this.calcularTotal();
            });
            
            // Configurar inicial
            this.pontosAparencia = parseInt(selectAparencia.value) || 0;
            this.atualizarBadge('pontosAparencia', this.pontosAparencia);
            this.atualizarDisplayAparencia();
        }
        
        // 2. RIQUEZA
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            selectRiqueza.addEventListener('change', (e) => {
                this.pontosRiqueza = parseInt(e.target.value) || 0;
                this.atualizarBadge('pontosRiqueza', this.pontosRiqueza);
                this.atualizarDisplayRiqueza();
                this.calcularTotal();
            });
            
            // Configurar inicial
            this.pontosRiqueza = parseInt(selectRiqueza.value) || 0;
            this.atualizarBadge('pontosRiqueza', this.pontosRiqueza);
            this.atualizarDisplayRiqueza();
        }
        
        // 3. IDIOMAS
        this.configurarSistemaIdiomas();
        
        // 4. CARACTERÍSTICAS FÍSICAS
        this.configurarCaracteristicasFisicas();
        
        // 5. CALCULAR TOTAL INICIAL
        this.calcularTotal();
        
        this.inicializado = true;
        console.log('✅ SistemaAparencia inicializado!');
    }

    // ================ APARÊNCIA ================
    atualizarDisplayAparencia() {
        const nivel = this.niveisAparencia[this.pontosAparencia];
        if (!nivel) return;
        
        const display = document.getElementById('displayAparencia');
        if (!display) return;
        
        const textoReacao = this.pontosAparencia >= 0 ? `Reação: +${this.pontosAparencia/4}` : `Reação: ${this.pontosAparencia/4}`;
        
        display.innerHTML = `
            <div class="display-header">
                <i class="${nivel.icone}" style="color: ${this.getCorPorPontos(this.pontosAparencia)}"></i>
                <div>
                    <strong>${nivel.nome}</strong>
                    <small>${textoReacao}</small>
                </div>
            </div>
            <p class="display-desc">${this.getDescricaoAparencia(this.pontosAparencia)}</p>
        `;
    }

    // ================ RIQUEZA ================
    atualizarDisplayRiqueza() {
        const nivel = this.niveisRiqueza[this.pontosRiqueza];
        if (!nivel) return;
        
        // Atualizar valores
        const multiplicador = document.getElementById('multiplicadorRiqueza');
        const renda = document.getElementById('rendaMensal');
        const descricao = document.getElementById('descricaoRiqueza');
        
        if (multiplicador) multiplicador.textContent = nivel.multiplicador + 'x';
        if (renda) renda.textContent = nivel.renda;
        if (descricao) descricao.textContent = `Nível: ${nivel.nome}`;
    }

    // ================ IDIOMAS ================
    configurarSistemaIdiomas() {
        const btnAdicionar = document.getElementById('btnAdicionarIdioma');
        if (!btnAdicionar) return;
        
        btnAdicionar.addEventListener('click', () => {
            const nomeInput = document.getElementById('novoIdiomaNome');
            const falaSelect = document.getElementById('novoIdiomaFala');
            const escritaSelect = document.getElementById('novoIdiomaEscrita');
            
            if (!nomeInput || !falaSelect || !escritaSelect) return;
            
            const nome = nomeInput.value.trim();
            if (!nome) {
                alert('Digite o nome do idioma!');
                return;
            }
            
            const pontosFala = parseInt(falaSelect.value) || 0;
            const pontosEscrita = parseInt(escritaSelect.value) || 0;
            const totalPontos = pontosFala + pontosEscrita;
            
            // Adicionar à lista
            this.idiomasAdicionais.push({
                nome: nome,
                pontos: totalPontos,
                fala: falaSelect.options[falaSelect.selectedIndex].text,
                escrita: escritaSelect.options[escritaSelect.selectedIndex].text
            });
            
            // Atualizar total de idiomas
            this.pontosIdiomas = this.idiomasAdicionais.reduce((total, idioma) => total + idioma.pontos, 0);
            this.atualizarBadge('pontosIdiomas', this.pontosIdiomas);
            
            // Atualizar lista
            this.atualizarListaIdiomas();
            
            // Limpar formulário
            nomeInput.value = '';
            falaSelect.value = '2';
            escritaSelect.value = '0';
            
            // Atualizar preview
            this.atualizarPreviewIdioma();
            
            // Calcular total
            this.calcularTotal();
        });
        
        // Atualizar preview em tempo real
        const falaSelect = document.getElementById('novoIdiomaFala');
        const escritaSelect = document.getElementById('novoIdiomaEscrita');
        
        if (falaSelect && escritaSelect) {
            const atualizarPreview = () => {
                const pontosFala = parseInt(falaSelect.value) || 0;
                const pontosEscrita = parseInt(escritaSelect.value) || 0;
                const total = pontosFala + pontosEscrita;
                
                const preview = document.getElementById('custoIdiomaPreview');
                if (preview) {
                    preview.textContent = total >= 0 ? `+${total} pts` : `${total} pts`;
                    preview.style.color = total >= 0 ? '#2ecc71' : '#e74c3c';
                }
            };
            
            falaSelect.addEventListener('change', atualizarPreview);
            escritaSelect.addEventListener('change', atualizarPreview);
            
            // Configurar inicial
            atualizarPreview();
        }
        
        // Atualizar total de idiomas
        const totalIdiomas = document.getElementById('totalIdiomas');
        if (totalIdiomas) {
            totalIdiomas.textContent = this.idiomasAdicionais.length;
        }
    }

    atualizarListaIdiomas() {
        const lista = document.getElementById('listaIdiomasAdicionais');
        if (!lista) return;
        
        if (this.idiomasAdicionais.length === 0) {
            lista.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-language"></i>
                    <p>Nenhum idioma adicional adicionado</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        this.idiomasAdicionais.forEach((idioma, index) => {
            html += `
                <div class="idioma-item">
                    <div class="idioma-info">
                        <strong>${idioma.nome}</strong>
                        <small>Fala: ${idioma.fala} | Escrita: ${idioma.escrita}</small>
                    </div>
                    <div class="idioma-pontos ${idioma.pontos >= 0 ? 'positivo' : 'negativo'}">
                        ${idioma.pontos >= 0 ? '+' : ''}${idioma.pontos} pts
                    </div>
                    <button class="btn-remover" onclick="window.sistemaAparencia.removerIdioma(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });
        
        lista.innerHTML = html;
        
        // Atualizar contador
        const totalIdiomas = document.getElementById('totalIdiomas');
        if (totalIdiomas) {
            totalIdiomas.textContent = this.idiomasAdicionais.length;
        }
    }

    removerIdioma(index) {
        if (index >= 0 && index < this.idiomasAdicionais.length) {
            this.idiomasAdicionais.splice(index, 1);
            this.pontosIdiomas = this.idiomasAdicionais.reduce((total, idioma) => total + idioma.pontos, 0);
            this.atualizarBadge('pontosIdiomas', this.pontosIdiomas);
            this.atualizarListaIdiomas();
            this.calcularTotal();
        }
    }

    atualizarPreviewIdioma() {
        const falaSelect = document.getElementById('novoIdiomaFala');
        const escritaSelect = document.getElementById('novoIdiomaEscrita');
        
        if (!falaSelect || !escritaSelect) return;
        
        const pontosFala = parseInt(falaSelect.value) || 0;
        const pontosEscrita = parseInt(escritaSelect.value) || 0;
        const total = pontosFala + pontosEscrita;
        
        const preview = document.getElementById('custoIdiomaPreview');
        if (preview) {
            preview.textContent = total >= 0 ? `+${total} pts` : `${total} pts`;
        }
    }

    // ================ CARACTERÍSTICAS FÍSICAS ================
    configurarCaracteristicasFisicas() {
        // Configurar botões de adicionar características
        document.querySelectorAll('.btn-caracteristica-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.caracteristica-item');
                if (!item) return;
                
                const tipo = item.getAttribute('data-tipo');
                const caracteristica = this.caracteristicasFisicas[tipo];
                
                if (!caracteristica) return;
                
                // Verificar se já foi selecionada
                const jaSelecionada = this.caracteristicasSelecionadas.find(c => c.tipo === tipo);
                if (jaSelecionada) {
                    alert('Esta característica já foi selecionada!');
                    return;
                }
                
                // Adicionar à lista
                this.caracteristicasSelecionadas.push({
                    tipo: tipo,
                    nome: caracteristica.nome,
                    pontos: caracteristica.pontos,
                    desc: caracteristica.desc
                });
                
                // Atualizar pontos
                this.pontosCaracteristicas = this.caracteristicasSelecionadas.reduce((total, c) => total + c.pontos, 0);
                this.atualizarBadge('pontosCaracteristicas', this.pontosCaracteristicas);
                
                // Atualizar lista
                this.atualizarListaCaracteristicas();
                
                // Calcular total
                this.calcularTotal();
            });
        });
    }

    atualizarListaCaracteristicas() {
        const lista = document.getElementById('caracteristicasSelecionadas');
        if (!lista) return;
        
        if (this.caracteristicasSelecionadas.length === 0) {
            lista.innerHTML = '<p class="vazio">Nenhuma característica selecionada</p>';
            return;
        }
        
        let html = '';
        this.caracteristicasSelecionadas.forEach((caracteristica, index) => {
            html += `
                <div class="caracteristica-selecionada">
                    <div class="caracteristica-info">
                        <strong>${caracteristica.nome}</strong>
                        <small>${caracteristica.desc}</small>
                    </div>
                    <div class="caracteristica-pontos ${caracteristica.pontos >= 0 ? 'positivo' : 'negativo'}">
                        ${caracteristica.pontos >= 0 ? '+' : ''}${caracteristica.pontos} pts
                    </div>
                    <button class="btn-remover" onclick="window.sistemaAparencia.removerCaracteristica(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });
        
        lista.innerHTML = html;
    }

    removerCaracteristica(index) {
        if (index >= 0 && index < this.caracteristicasSelecionadas.length) {
            this.caracteristicasSelecionadas.splice(index, 1);
            this.pontosCaracteristicas = this.caracteristicasSelecionadas.reduce((total, c) => total + c.pontos, 0);
            this.atualizarBadge('pontosCaracteristicas', this.pontosCaracteristicas);
            this.atualizarListaCaracteristicas();
            this.calcularTotal();
        }
    }

    // ================ CÁLCULO DE TOTAL ================
    calcularTotal() {
        const totalPontos = this.pontosAparencia + this.pontosRiqueza + this.pontosIdiomas + this.pontosCaracteristicas;
        
        console.log('📊 Total de pontos na aba Características:', totalPontos);
        console.log('  - Aparência:', this.pontosAparencia);
        console.log('  - Riqueza:', this.pontosRiqueza);
        console.log('  - Idiomas:', this.pontosIdiomas);
        console.log('  - Características Físicas:', this.pontosCaracteristicas);
        
        // Se quiser exibir o total em algum lugar na aba
        const totalDisplay = document.getElementById('totalCaracteristicas');
        if (totalDisplay) {
            totalDisplay.textContent = totalPontos >= 0 ? `+${totalPontos} pts` : `${totalPontos} pts`;
            totalDisplay.style.color = totalPontos >= 0 ? '#2ecc71' : '#e74c3c';
        }
        
        // Disparar evento para o dashboard (se precisar)
        const evento = new CustomEvent('caracteristicasAtualizadas', {
            detail: {
                total: totalPontos,
                detalhes: {
                    aparencia: this.pontosAparencia,
                    riqueza: this.pontosRiqueza,
                    idiomas: this.pontosIdiomas,
                    caracteristicas: this.pontosCaracteristicas
                }
            }
        });
        document.dispatchEvent(evento);
    }

    // ================ FUNÇÕES AUXILIARES ================
    atualizarBadge(id, pontos) {
        const badge = document.getElementById(id);
        if (!badge) return;
        
        badge.textContent = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
        badge.style.background = pontos >= 0 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)';
        badge.style.borderColor = pontos >= 0 ? '#2ecc71' : '#e74c3c';
        badge.style.color = pontos >= 0 ? '#2ecc71' : '#e74c3c';
    }

    getCorPorPontos(pontos) {
        if (pontos > 0) return '#2ecc71';  // Verde
        if (pontos < 0) return '#e74c3c';  // Vermelho
        return '#3498db';  // Azul
    }

    getDescricaoAparencia(pontos) {
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
        return descricoes[pontos] || "Descrição não disponível";
    }

    // ================ GETTERS ================
    getTotalPontos() {
        return this.pontosAparencia + this.pontosRiqueza + this.pontosIdiomas + this.pontosCaracteristicas;
    }
    
    getDetalhesPontos() {
        return {
            aparencia: this.pontosAparencia,
            riqueza: this.pontosRiqueza,
            idiomas: this.pontosIdiomas,
            caracteristicas: this.pontosCaracteristicas,
            total: this.getTotalPontos()
        };
    }
}

// ================ INICIALIZAÇÃO ================
(function() {
    console.log('📁 Carregando SistemaAparencia...');
    
    // Criar instância global
    window.sistemaAparencia = new SistemaAparencia();
    
    // Inicializar quando a aba for clicada
    document.addEventListener('click', function(e) {
        const tabBtn = e.target.closest('[data-tab="caracteristicas"]');
        if (tabBtn && !window.sistemaAparencia.inicializado) {
            setTimeout(() => window.sistemaAparencia.inicializar(), 300);
        }
    });
    
    // Tentar inicializar automaticamente após 3 segundos
    setTimeout(() => {
        if (!window.sistemaAparencia.inicializado) {
            window.sistemaAparencia.inicializar();
        }
    }, 3000);
})();

console.log('🎭 SistemaAparencia carregado!');