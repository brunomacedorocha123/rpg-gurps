// =============================================
// CARACTERÍSTICAS FÍSICAS - SISTEMA COMPLETO
// Inclui: Características Físicas + Altura/Peso + Aparência Visual
// =============================================

class SistemaCaracteristicasFisicas {
    constructor() {
        // CARACTERÍSTICAS FÍSICAS (MAGRO/GORDO/NANISMO/ETC)
        this.caracteristicas = {
            "magro": { 
                pontos: -5,
                nome: "Magro",
                tipo: "desvantagem",
                efeitos: "Peso = 2/3 do normal (×0.67)",
                pesoMultiplicador: 0.67,
                alturaMaxima: null,
                icone: "fas fa-person-walking",
                descricao: "Peso reduzido para 67% da média do ST",
                modificadores: { stDerrubar: -2, disfarce: -2, htMaxima: 14 },
                conflitos: ["acima-peso", "gordo", "muito-gordo"]
            },
            "acima-peso": { 
                pontos: -1,
                nome: "Acima do Peso",
                tipo: "desvantagem", 
                efeitos: "Peso = 130% do normal (×1.3)",
                pesoMultiplicador: 1.3,
                alturaMaxima: null,
                icone: "fas fa-weight-hanging",
                descricao: "Peso aumentado para 130% da média do ST",
                modificadores: { disfarce: -1, natacao: 1, stDerrubar: 1 },
                conflitos: ["magro", "gordo", "muito-gordo"]
            },
            "gordo": { 
                pontos: -3,
                nome: "Gordo",
                tipo: "desvantagem",
                efeitos: "Peso = 150% do normal (×1.5)",
                pesoMultiplicador: 1.5,
                alturaMaxima: null,
                icone: "fas fa-weight-hanging",
                descricao: "Peso aumentado para 150% da média do ST",
                modificadores: { disfarce: -2, natacao: 3, stDerrubar: 2, htMaxima: 15 },
                conflitos: ["magro", "acima-peso", "muito-gordo"]
            },
            "muito-gordo": { 
                pontos: -5,
                nome: "Muito Gordo",
                tipo: "desvantagem",
                efeitos: "Peso = 200% do normal (×2.0)",
                pesoMultiplicador: 2.0,
                alturaMaxima: null,
                icone: "fas fa-weight-hanging",
                descricao: "Peso dobrado em relação à média do ST",
                modificadores: { disfarce: -3, natacao: 5, stDerrubar: 3, htMaxima: 13 },
                conflitos: ["magro", "acima-peso", "gordo"]
            },
            "nanismo": { 
                pontos: -15,
                nome: "Nanismo",
                tipo: "desvantagem",
                efeitos: "Altura máxima: 1.32m",
                pesoMultiplicador: null,
                alturaMaxima: 1.32,
                icone: "fas fa-arrow-down",
                descricao: "Altura limitada a 1.32m máximo",
                modificadores: { tamanho: -1, deslocamento: -1, disfarce: -2, perseguicao: -2 },
                conflitos: ["gigantismo"]
            },
            "gigantismo": { 
                pontos: 0,
                nome: "Gigantismo",
                tipo: "vantagem",
                efeitos: "Altura acima do máximo racial",
                pesoMultiplicador: null,
                alturaMaxima: null,
                icone: "fas fa-arrow-up",
                descricao: "Altura acima do máximo para a raça",
                modificadores: { tamanho: 1, deslocamento: 1, disfarce: -2, perseguicao: -2 },
                conflitos: ["nanismo"]
            }
        };

        // CARACTERÍSTICAS VISUAIS
        this.caracteristicasVisuais = {
            "cor-pele": [
                "Muito clara", "Clara", "Morena clara", "Morena", "Morena escura", "Escura", "Muito escura"
            ],
            "cor-olhos": [
                "Azuis", "Verdes", "Castanhos claros", "Castanhos", "Castanhos escuros", "Pretos", "Vermelhos", "Âmbar"
            ],
            "cor-cabelo": [
                "Loiro", "Ruivo", "Castanho claro", "Castanho", "Castanho escuro", "Preto", "Grisalho", "Branco"
            ],
            "tipo-cabelo": [
                "Liso", "Ondulado", "Cacheado", "Crespo", "Careca", "Calvo", "Longo", "Curto", "Médio"
            ],
            "tipo-rosto": [
                "Oval", "Redondo", "Quadrado", "Alongado", "Triangular", "Diamante", "Coração"
            ],
            "idade": { min: 12, max: 100, default: 25 }
        };

        // TABELAS DE ALTURA/PESO BASEADAS NO ST
        this.alturaPorST = {
            6: { min: 1.30, max: 1.55 },
            7: { min: 1.38, max: 1.63 },
            8: { min: 1.45, max: 1.70 },
            9: { min: 1.53, max: 1.78 },
            10: { min: 1.58, max: 1.83 },
            11: { min: 1.63, max: 1.88 },
            12: { min: 1.70, max: 1.95 },
            13: { min: 1.78, max: 2.03 },
            14: { min: 1.85, max: 2.10 },
            15: { min: 1.90, max: 2.15 },
            16: { min: 1.95, max: 2.20 }
        };

        this.pesoPorST = {
            6: { min: 30, max: 60 },
            7: { min: 37.5, max: 67.5 },
            8: { min: 45.0, max: 75.0 },
            9: { min: 52.5, max: 82.5 },
            10: { min: 57.5, max: 87.5 },
            11: { min: 62.5, max: 97.5 },
            12: { min: 70.0, max: 110.0 },
            13: { min: 77.5, max: 122.5 },
            14: { min: 85.0, max: 135.0 },
            15: { min: 92.5, max: 147.5 },
            16: { min: 100.0, max: 160.0 }
        };

        // ESTADO DO SISTEMA
        this.caracteristicasSelecionadas = [];
        this.visualSelecionado = {
            "cor-pele": "Morena",
            "cor-olhos": "Castanhos",
            "cor-cabelo": "Castanho",
            "tipo-cabelo": "Curto",
            "tipo-rosto": "Oval",
            "idade": 25
        };
        
        // ALTURA/PESO ATUAL
        this.altura = 1.70;
        this.peso = 70;
        this.stBase = 10;
        
        // INICIALIZAÇÃO
        this.inicializado = false;
        this.carregarDoLocalStorage();
    }

    // =============================================
    // INICIALIZAÇÃO E CONFIGURAÇÃO
    // =============================================

    inicializar() {
        if (this.inicializado) return;
        
        this.configurarEventos();
        this.atualizarSTDoPersonagem();
        this.atualizarTudo();
        this.inicializado = true;
    }

    configurarEventos() {
        // Eventos para botões de características
        this.configurarEventosCaracteristicas();
        
        // Eventos para altura/peso
        this.configurarEventosAlturaPeso();
        
        // Eventos para características visuais
        this.configurarEventosVisuais();
        
        // Escutar mudanças no ST
        this.configurarEscutaST();
    }

    configurarEventosCaracteristicas() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-add-caracteristica')) {
                const btn = e.target.closest('.btn-add-caracteristica');
                const tipo = btn.dataset.tipo;
                this.alternarCaracteristica(tipo);
            }
            
            if (e.target.closest('.btn-remover-caracteristica')) {
                const btn = e.target.closest('.btn-remover-caracteristica');
                const id = parseInt(btn.dataset.id);
                this.removerCaracteristica(id);
            }
        });
    }

    configurarEventosAlturaPeso() {
        const inputAltura = document.getElementById('altura');
        const inputPeso = document.getElementById('peso');
        
        if (inputAltura) {
            inputAltura.addEventListener('change', () => {
                this.definirAltura(parseFloat(inputAltura.value));
            });
        }
        
        if (inputPeso) {
            inputPeso.addEventListener('change', () => {
                this.definirPeso(parseInt(inputPeso.value));
            });
        }
    }

    configurarEventosVisuais() {
        // Eventos para selects visuais
        const selectsVisuais = document.querySelectorAll('.select-visual');
        selectsVisuais.forEach(select => {
            select.addEventListener('change', (e) => {
                const tipo = e.target.dataset.tipo;
                const valor = e.target.value;
                this.atualizarVisual(tipo, valor);
            });
        });
        
        // Evento para idade
        const inputIdade = document.getElementById('idade-personagem');
        if (inputIdade) {
            inputIdade.addEventListener('change', () => {
                this.atualizarVisual('idade', parseInt(inputIdade.value));
            });
        }
    }

    configurarEscutaST() {
        // Escutar mudanças no atributo ST
        const inputST = document.getElementById('ST');
        if (inputST) {
            inputST.addEventListener('change', () => {
                this.atualizarSTDoPersonagem();
            });
            
            inputST.addEventListener('input', () => {
                clearTimeout(this.stTimeout);
                this.stTimeout = setTimeout(() => {
                    this.atualizarSTDoPersonagem();
                }, 500);
            });
        }
        
        // Também escutar eventos do sistema de atributos
        document.addEventListener('atributosAtualizados', () => {
            this.atualizarSTDoPersonagem();
        });
    }

    // =============================================
    // GERENCIAMENTO DE CARACTERÍSTICAS FÍSICAS
    // =============================================

    alternarCaracteristica(tipo) {
        const jaSelecionada = this.caracteristicasSelecionadas.find(c => c.tipo === tipo);
        
        if (jaSelecionada) {
            this.removerCaracteristica(jaSelecionada.id);
        } else {
            this.adicionarCaracteristica(tipo);
        }
    }

    adicionarCaracteristica(tipo) {
        const caracteristica = this.caracteristicas[tipo];
        if (!caracteristica) return;

        // Verificar se já está selecionada
        if (this.caracteristicasSelecionadas.find(c => c.tipo === tipo)) {
            this.mostrarMensagem(`${caracteristica.nome} já está selecionada!`, 'aviso');
            return;
        }

        // Remover características conflitantes
        this.removerCaracteristicasConflitantes(tipo);

        // Criar objeto da característica
        const caracteristicaObj = {
            id: Date.now() + Math.random(),
            tipo: tipo,
            nome: caracteristica.nome,
            pontos: caracteristica.pontos,
            efeitos: caracteristica.efeitos,
            descricao: caracteristica.descricao,
            pesoMultiplicador: caracteristica.pesoMultiplicador,
            alturaMaxima: caracteristica.alturaMaxima,
            modificadores: caracteristica.modificadores,
            icone: caracteristica.icone,
            dataAdicao: new Date().toISOString()
        };

        // Adicionar à lista
        this.caracteristicasSelecionadas.push(caracteristicaObj);
        
        // Aplicar efeitos imediatos
        this.aplicarEfeitosCaracteristica(caracteristicaObj);
        
        // Atualizar display
        this.atualizarTudo();
        
        // Notificar
        this.mostrarMensagem(`${caracteristica.nome} adicionada!`, 'sucesso');
        
        return caracteristicaObj;
    }

    removerCaracteristicasConflitantes(tipoNova) {
        const caracteristica = this.caracteristicas[tipoNova];
        if (!caracteristica || !caracteristica.conflitos) return;

        caracteristica.conflitos.forEach(tipoConflito => {
            const index = this.caracteristicasSelecionadas.findIndex(c => c.tipo === tipoConflito);
            if (index !== -1) {
                this.caracteristicasSelecionadas.splice(index, 1);
            }
        });
    }

    removerCaracteristica(id) {
        const index = this.caracteristicasSelecionadas.findIndex(c => c.id === id);
        if (index !== -1) {
            const removida = this.caracteristicasSelecionadas[index];
            this.caracteristicasSelecionadas.splice(index, 1);
            
            // Reverter efeitos
            this.reverterEfeitosCaracteristica(removida);
            
            // Atualizar tudo
            this.atualizarTudo();
            
            this.mostrarMensagem(`${removida.nome} removida!`, 'sucesso');
        }
    }

    aplicarEfeitosCaracteristica(caracteristica) {
        // Se for nanismo, ajustar altura máxima
        if (caracteristica.tipo === 'nanismo' && caracteristica.alturaMaxima) {
            if (this.altura > caracteristica.alturaMaxima) {
                this.definirAltura(caracteristica.alturaMaxima);
            }
        }
    }

    reverterEfeitosCaracteristica(caracteristica) {
        // Nada específico por enquanto
    }

    // =============================================
    // GERENCIAMENTO DE ALTURA E PESO
    // =============================================

    atualizarSTDoPersonagem() {
        // Tentar obter ST do input
        const inputST = document.getElementById('ST');
        let novoST = 10;
        
        if (inputST && inputST.value) {
            const stVal = parseInt(inputST.value);
            if (!isNaN(stVal) && stVal >= 1 && stVal <= 40) {
                novoST = stVal;
            }
        }
        
        // Verificar se mudou
        if (novoST !== this.stBase) {
            this.stBase = novoST;
            this.atualizarFaixasAlturaPeso();
            this.atualizarTudo();
        }
    }

    atualizarFaixasAlturaPeso() {
        // Atualizar exibição das faixas baseadas no ST
        const faixaAltura = this.obterFaixaAltura(this.stBase);
        const faixaPeso = this.obterFaixaPeso(this.stBase);
        
        const elementoAltura = document.getElementById('alturaFaixa');
        const elementoPeso = document.getElementById('pesoFaixa');
        
        if (elementoAltura) {
            elementoAltura.textContent = `${faixaAltura.min}m - ${faixaAltura.max}m`;
        }
        
        if (elementoPeso) {
            elementoPeso.textContent = `${faixaPeso.min}kg - ${faixaPeso.max}kg`;
        }
    }

    obterFaixaAltura(st) {
        if (st >= 6 && st <= 16) {
            return this.alturaPorST[st];
        }
        
        // Extrapolar para STs fora da tabela
        if (st > 16) {
            const stExtra = st - 16;
            const incremento = stExtra * 0.05;
            return {
                min: (this.alturaPorST[16].min + incremento).toFixed(2),
                max: (this.alturaPorST[16].max + incremento).toFixed(2)
            };
        }
        
        if (st < 6) {
            const stFaltante = 6 - st;
            const decremento = stFaltante * 0.05;
            return {
                min: (this.alturaPorST[6].min - decremento).toFixed(2),
                max: (this.alturaPorST[6].max - decremento).toFixed(2)
            };
        }
        
        return { min: 1.30, max: 2.50 };
    }

    obterFaixaPeso(st) {
        if (st >= 6 && st <= 16) {
            return this.pesoPorST[st];
        }
        
        // Extrapolar para STs fora da tabela
        if (st > 16) {
            const stExtra = st - 16;
            const incremento = stExtra * 10;
            return {
                min: this.pesoPorST[16].min + incremento,
                max: this.pesoPorST[16].max + incremento
            };
        }
        
        if (st < 6) {
            const stFaltante = 6 - st;
            const decremento = stFaltante * 5;
            return {
                min: Math.max(20, this.pesoPorST[6].min - decremento),
                max: Math.max(25, this.pesoPorST[6].max - decremento)
            };
        }
        
        return { min: 30, max: 200 };
    }

    definirAltura(novaAltura) {
        // Verificar se há nanismo ativo
        const nanismo = this.caracteristicasSelecionadas.find(c => c.tipo === 'nanismo');
        if (nanismo && nanismo.alturaMaxima && novaAltura > nanismo.alturaMaxima) {
            novaAltura = nanismo.alturaMaxima;
        }
        
        // Limites gerais
        if (novaAltura < 1.20) novaAltura = 1.20;
        if (novaAltura > 2.50) novaAltura = 2.50;
        
        // Atualizar valor
        this.altura = parseFloat(novaAltura.toFixed(2));
        
        // Atualizar input
        const inputAltura = document.getElementById('altura');
        if (inputAltura) inputAltura.value = this.altura;
        
        // Verificar conformidade e atualizar
        this.atualizarTudo();
        this.salvarNoLocalStorage();
    }

    definirPeso(novoPeso) {
        // Limites gerais
        if (novoPeso < 20) novoPeso = 20;
        if (novoPeso > 200) novoPeso = 200;
        
        // Atualizar valor
        this.peso = parseInt(novoPeso);
        
        // Atualizar input
        const inputPeso = document.getElementById('peso');
        if (inputPeso) inputPeso.value = this.peso;
        
        // Verificar conformidade e atualizar
        this.atualizarTudo();
        this.salvarNoLocalStorage();
    }

    ajustarAltura(variacao) {
        this.definirAltura(this.altura + variacao);
    }

    ajustarPeso(variacao) {
        this.definirPeso(this.peso + variacao);
    }

    // =============================================
    // GERENCIAMENTO DE CARACTERÍSTICAS VISUAIS
    // =============================================

    atualizarVisual(tipo, valor) {
        if (this.caracteristicasVisuais[tipo] || tipo === 'idade') {
            this.visualSelecionado[tipo] = valor;
            this.salvarNoLocalStorage();
            
            // Atualizar display visual se existir
            this.atualizarDisplayVisuais();
        }
    }

    gerarDescricaoVisual() {
        const vis = this.visualSelecionado;
        return `${vis.idade} anos, pele ${vis['cor-pele'].toLowerCase()}, olhos ${vis['cor-olhos'].toLowerCase()}, cabelo ${vis['cor-cabelo'].toLowerCase()} ${vis['tipo-cabelo'].toLowerCase()}, rosto ${vis['tipo-rosto'].toLowerCase()}`;
    }

    // =============================================
    // CÁLCULOS E VERIFICAÇÕES
    // =============================================

    verificarConformidade() {
        const faixaAltura = this.obterFaixaAltura(this.stBase);
        const faixaPesoOriginal = this.obterFaixaPeso(this.stBase);
        
        // Obter multiplicador de peso ativo
        let multiplicadorPeso = 1.0;
        const caracteristicaPeso = this.caracteristicasSelecionadas.find(c => c.pesoMultiplicador);
        if (caracteristicaPeso) {
            multiplicadorPeso = caracteristicaPeso.pesoMultiplicador;
        }
        
        // Ajustar faixa de peso pelo multiplicador
        const faixaPesoAjustada = {
            min: faixaPesoOriginal.min * multiplicadorPeso,
            max: faixaPesoOriginal.max * multiplicadorPeso
        };
        
        // Verificar nanismo
        const nanismo = this.caracteristicasSelecionadas.find(c => c.tipo === 'nanismo');
        const alturaValida = nanismo ? 
            this.altura <= (nanismo.alturaMaxima || 1.32) : 
            this.altura >= faixaAltura.min && this.altura <= faixaAltura.max;
        
        // Verificar peso
        const pesoValido = this.peso >= faixaPesoAjustada.min && this.peso <= faixaPesoAjustada.max;
        
        return {
            alturaValida,
            pesoValido,
            faixaAltura,
            faixaPeso: faixaPesoAjustada,
            faixaPesoOriginal,
            multiplicadorPeso,
            caracteristicaAtiva: caracteristicaPeso,
            nanismoAtivo: !!nanismo,
            dentroDaFaixa: alturaValida && pesoValido
        };
    }

    calcularPontosCaracteristicas() {
        return this.caracteristicasSelecionadas.reduce((total, carac) => total + carac.pontos, 0);
    }

    // =============================================
    // ATUALIZAÇÃO DE DISPLAY
    // =============================================

    atualizarTudo() {
        const conformidade = this.verificarConformidade();
        
        // 1. Atualizar status geral
        this.atualizarStatusGeral(conformidade);
        
        // 2. Atualizar altura/peso
        this.atualizarStatusAlturaPeso(conformidade);
        
        // 3. Atualizar informações da faixa
        this.atualizarInfoFaixas(conformidade);
        
        // 4. Atualizar características selecionadas
        this.atualizarCaracteristicasSelecionadas();
        
        // 5. Atualizar badge de pontos
        this.atualizarBadgePontos();
        
        // 6. Atualizar botões das características
        this.atualizarBotoesCaracteristicas();
        
        // 7. Atualizar desvantagens ativas
        this.atualizarDesvantagensAtivas();
        
        // 8. Atualizar ST base
        this.atualizarElemento('stBase', this.stBase);
    }

    atualizarStatusGeral(conformidade) {
        const statusFisico = document.getElementById('statusFisico');
        if (!statusFisico) return;

        if (conformidade.nanismoAtivo) {
            statusFisico.textContent = "Nanismo";
            statusFisico.style.background = "#e74c3c";
            statusFisico.style.color = "white";
        } else if (conformidade.caracteristicaAtiva) {
            statusFisico.textContent = conformidade.caracteristicaAtiva.nome;
            statusFisico.style.background = "#f39c12";
            statusFisico.style.color = "white";
        } else if (conformidade.dentroDaFaixa) {
            statusFisico.textContent = "Normal";
            statusFisico.style.background = "#27ae60";
            statusFisico.style.color = "white";
        } else {
            statusFisico.textContent = "Fora da Faixa";
            statusFisico.style.background = "#f39c12";
            statusFisico.style.color = "white";
        }
    }

    atualizarStatusAlturaPeso(conformidade) {
        // Status da altura
        const statusAltura = document.getElementById('statusAltura');
        if (statusAltura) {
            let status = '';
            if (conformidade.nanismoAtivo) {
                status = `Nanismo: Altura ${this.altura}m`;
            } else {
                status = conformidade.alturaValida ? 
                    `Dentro da faixa para ST ${this.stBase}` : 
                    this.altura < conformidade.faixaAltura.min ? 
                        `Abaixo do mínimo (${conformidade.faixaAltura.min}m)` :
                        `Acima do máximo (${conformidade.faixaAltura.max}m)`;
            }
            statusAltura.textContent = status;
        }

        // Status do peso
        const statusPeso = document.getElementById('statusPeso');
        if (statusPeso) {
            let status = '';
            if (conformidade.caracteristicaAtiva && conformidade.multiplicadorPeso !== 1.0) {
                const nome = conformidade.caracteristicaAtiva.nome;
                status = conformidade.pesoValido ? 
                    `${nome}: Dentro da faixa` : 
                    this.peso < conformidade.faixaPeso.min ? 
                        `${nome}: Abaixo do mínimo (${conformidade.faixaPeso.min.toFixed(1)}kg)` :
                        `${nome}: Acima do máximo (${conformidade.faixaPeso.max.toFixed(1)}kg)`;
            } else {
                status = conformidade.pesoValido ? 
                    `Dentro da faixa para ST ${this.stBase}` : 
                    this.peso < conformidade.faixaPeso.min ? 
                        `Abaixo do mínimo (${conformidade.faixaPeso.min.toFixed(1)}kg)` :
                        `Acima do máximo (${conformidade.faixaPeso.max.toFixed(1)}kg)`;
            }
            statusPeso.textContent = status;
        }
    }

    atualizarInfoFaixas(conformidade) {
        // Faixa de altura
        const alturaFaixa = document.getElementById('alturaFaixa');
        if (alturaFaixa) {
            if (conformidade.nanismoAtivo) {
                alturaFaixa.textContent = `Máx: 1.32m (Nanismo)`;
            } else {
                alturaFaixa.textContent = `${conformidade.faixaAltura.min}m - ${conformidade.faixaAltura.max}m`;
            }
        }

        // Faixa de peso
        const pesoFaixa = document.getElementById('pesoFaixa');
        if (pesoFaixa) {
            if (conformidade.caracteristicaAtiva && conformidade.multiplicadorPeso !== 1.0) {
                pesoFaixa.textContent = 
                    `${conformidade.faixaPeso.min.toFixed(1)}kg - ${conformidade.faixaPeso.max.toFixed(1)}kg (${conformidade.caracteristicaAtiva.nome})`;
            } else {
                pesoFaixa.textContent = 
                    `${conformidade.faixaPesoOriginal.min}kg - ${conformidade.faixaPesoOriginal.max}kg`;
            }
        }

        // Modificador
        const modificador = document.getElementById('modificadorPeso');
        if (modificador) {
            if (conformidade.nanismoAtivo) {
                modificador.textContent = 'Nanismo Ativo';
            } else if (conformidade.caracteristicaAtiva && conformidade.multiplicadorPeso !== 1.0) {
                modificador.textContent = `${conformidade.caracteristicaAtiva.nome} (${conformidade.multiplicadorPeso}x)`;
            } else {
                modificador.textContent = conformidade.dentroDaFaixa ? 'Dentro da faixa' : 'Fora da faixa';
            }
        }
    }

    atualizarCaracteristicasSelecionadas() {
        const container = document.getElementById('caracteristicasSelecionadas');
        if (!container) return;

        if (this.caracteristicasSelecionadas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-info-circle"></i>
                    Nenhuma característica física selecionada
                </div>
            `;
            return;
        }

        container.innerHTML = this.caracteristicasSelecionadas.map(carac => `
            <div class="caracteristica-selecionada">
                <div class="caracteristica-info">
                    <i class="${carac.icone}"></i>
                    <div>
                        <strong>${carac.nome}</strong>
                        <small>${carac.descricao}</small>
                    </div>
                </div>
                <div class="caracteristica-actions">
                    <span class="caracteristica-pontos ${carac.pontos >= 0 ? 'positivo' : 'negativo'}">
                        ${carac.pontos >= 0 ? '+' : ''}${carac.pontos}
                    </span>
                    <button class="btn-remover-caracteristica" data-id="${carac.id}" 
                            title="Remover característica">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    atualizarBadgePontos() {
        const badge = document.getElementById('pontosCaracteristicas');
        if (badge) {
            const pontos = this.calcularPontosCaracteristicas();
            const texto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
            badge.textContent = texto;
            
            // Aplicar cor
            badge.className = 'pontos-badge';
            if (pontos > 0) {
                badge.classList.add('positivo');
            } else if (pontos < 0) {
                badge.classList.add('negativo');
            }
        }
    }

    atualizarBotoesCaracteristicas() {
        document.querySelectorAll('.caracteristica-item').forEach(item => {
            const tipo = item.dataset.tipo;
            const botao = item.querySelector('.btn-add-caracteristica');
            const jaSelecionada = this.caracteristicasSelecionadas.find(c => c.tipo === tipo);
            
            if (botao) {
                if (jaSelecionada) {
                    botao.textContent = 'Remover';
                    botao.classList.add('active');
                } else {
                    botao.textContent = 'Adicionar';
                    botao.classList.remove('active');
                }
            }
        });
    }

    atualizarDesvantagensAtivas() {
        const container = document.getElementById('desvantagensAtivas');
        const lista = document.getElementById('listaDesvantagens');
        
        if (!container || !lista) return;

        if (this.caracteristicasSelecionadas.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        
        lista.innerHTML = this.caracteristicasSelecionadas.map(carac => {
            let icone = carac.icone || 'fas fa-circle';
            let efeito = carac.efeitos;
            
            return `
                <div class="desvantagem-item">
                    <div class="desvantagem-icone">
                        <i class="${icone}"></i>
                    </div>
                    <div class="desvantagem-info">
                        <strong>${carac.nome}</strong>
                        <small>${efeito}</small>
                    </div>
                    <div class="desvantagem-pontos ${carac.pontos >= 0 ? 'positivo' : 'negativo'}">
                        ${carac.pontos >= 0 ? '+' : ''}${carac.pontos}
                    </div>
                </div>
            `;
        }).join('');
    }

    atualizarDisplayVisuais() {
        // Atualizar cada select visual
        Object.keys(this.visualSelecionado).forEach(tipo => {
            const select = document.querySelector(`select[data-tipo="${tipo}"]`);
            if (select) {
                select.value = this.visualSelecionado[tipo];
            }
            
            const input = document.getElementById(`input-${tipo}`);
            if (input && input.type === 'number') {
                input.value = this.visualSelecionado[tipo];
            }
        });
        
        // Atualizar descrição se existir elemento
        const descElement = document.getElementById('descricaoVisual');
        if (descElement) {
            descElement.textContent = this.gerarDescricaoVisual();
        }
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    }

    // =============================================
    // MENSAGENS E UTILITÁRIOS
    // =============================================

    mostrarMensagem(mensagem, tipo = 'info') {
        const cores = {
            sucesso: '#27ae60',
            erro: '#e74c3c',
            aviso: '#f39c12',
            info: '#3498db'
        };
        
        // Remover mensagem existente
        const existing = document.getElementById('fisicaMensagem');
        if (existing) existing.remove();
        
        // Criar nova mensagem
        const div = document.createElement('div');
        div.id = 'fisicaMensagem';
        div.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 6px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                background: ${cores[tipo] || '#3498db'};
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease;
            ">
                ${mensagem}
            </div>
        `;
        
        document.body.appendChild(div);
        
        // Remover após 3 segundos
        setTimeout(() => {
            if (div.parentNode) div.parentNode.removeChild(div);
        }, 3000);
    }

    // =============================================
    // LOCAL STORAGE
    // =============================================

    salvarNoLocalStorage() {
        try {
            const dados = {
                caracteristicasSelecionadas: this.caracteristicasSelecionadas,
                visualSelecionado: this.visualSelecionado,
                altura: this.altura,
                peso: this.peso,
                stBase: this.stBase,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('gurps_caracteristicas_fisicas', JSON.stringify(dados));
        } catch (error) {
            console.warn('Não foi possível salvar características físicas:', error);
        }
    }

    carregarDoLocalStorage() {
        try {
            const dadosSalvos = localStorage.getItem('gurps_caracteristicas_fisicas');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                
                if (dados.caracteristicasSelecionadas) {
                    this.caracteristicasSelecionadas = dados.caracteristicasSelecionadas;
                }
                
                if (dados.visualSelecionado) {
                    this.visualSelecionado = dados.visualSelecionado;
                }
                
                if (dados.altura !== undefined) {
                    this.altura = dados.altura;
                }
                
                if (dados.peso !== undefined) {
                    this.peso = dados.peso;
                }
                
                if (dados.stBase !== undefined) {
                    this.stBase = dados.stBase;
                }
                
                return true;
            }
        } catch (error) {
            console.warn('Não foi possível carregar características físicas:', error);
        }
        return false;
    }

    // =============================================
    // EXPORTAÇÃO E IMPORTAÇÃO
    // =============================================

    exportarDados() {
        const conformidade = this.verificarConformidade();
        
        return {
            caracteristicasFisicas: {
                selecionadas: this.caracteristicasSelecionadas,
                pontosTotais: this.calcularPontosCaracteristicas(),
                visual: this.visualSelecionado,
                descricaoVisual: this.gerarDescricaoVisual(),
                altura: this.altura,
                peso: this.peso,
                stBase: this.stBase,
                conformidade: conformidade,
                multiplicadorPeso: conformidade.multiplicadorPeso,
                nanismoAtivo: conformidade.nanismoAtivo
            }
        };
    }

    carregarDados(dados) {
        if (dados.caracteristicasFisicas) {
            const fisicas = dados.caracteristicasFisicas;
            
            if (fisicas.selecionadas) {
                this.caracteristicasSelecionadas = fisicas.selecionadas;
            }
            
            if (fisicas.visual) {
                this.visualSelecionado = fisicas.visual;
            }
            
            if (fisicas.altura !== undefined) {
                this.altura = fisicas.altura;
            }
            
            if (fisicas.peso !== undefined) {
                this.peso = fisicas.peso;
            }
            
            if (fisicas.stBase !== undefined) {
                this.stBase = fisicas.stBase;
            }
            
            this.atualizarTudo();
            return true;
        }
        return false;
    }
}

// =============================================
// INICIALIZAÇÃO GLOBAL
// =============================================

let sistemaCaracteristicasFisicas = null;

function inicializarSistemaCaracteristicasFisicas() {
    if (!sistemaCaracteristicasFisicas) {
        sistemaCaracteristicasFisicas = new SistemaCaracteristicasFisicas();
    }
    
    sistemaCaracteristicasFisicas.inicializar();
    return sistemaCaracteristicasFisicas;
}

// INICIALIZAR QUANDO A SUB-ABA FOR ATIVA
document.addEventListener('DOMContentLoaded', function() {
    // Função para verificar sub-aba ativa
    function verificarSubAbaAtiva() {
        const subtabAtiva = document.querySelector('#subtab-caracteristicas-fisicas.active');
        if (subtabAtiva) {
            setTimeout(inicializarSistemaCaracteristicasFisicas, 100);
        }
    }
    
    // Observar mudanças na aba principal
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'caracteristicas' && tab.classList.contains('active')) {
                    setTimeout(verificarSubAbaAtiva, 100);
                }
            }
        });
    });
    
    const tabCaracteristicas = document.getElementById('caracteristicas');
    if (tabCaracteristicas) {
        observer.observe(tabCaracteristicas, { attributes: true });
    }
    
    // Evento para troca de sub-abas
    document.addEventListener('click', function(e) {
        if (e.target.closest('.subtab-btn')) {
            const btn = e.target.closest('.subtab-btn');
            const subtabId = btn.dataset.subtab;
            
            if (subtabId === 'caracteristicas-fisicas') {
                setTimeout(inicializarSistemaCaracteristicasFisicas, 100);
            }
        }
    });
});

// FUNÇÕES GLOBAIS PARA CONTROLES
window.ajustarAltura = (variacao) => {
    if (sistemaCaracteristicasFisicas) {
        sistemaCaracteristicasFisicas.ajustarAltura(variacao);
    }
};

window.ajustarPeso = (variacao) => {
    if (sistemaCaracteristicasFisicas) {
        sistemaCaracteristicasFisicas.ajustarPeso(variacao);
    }
};

// EXPORTAR PARA USO GLOBAL
window.SistemaCaracteristicasFisicas = SistemaCaracteristicasFisicas;
window.inicializarSistemaCaracteristicasFisicas = inicializarSistemaCaracteristicasFisicas;
window.sistemaCaracteristicasFisicas = sistemaCaracteristicasFisicas;