// caracteristicas-altura-peso.js
// ===== SISTEMA DE ALTURA E PESO - GURPS =====
// Baseado em ST com ajustes para características físicas

class SistemaAlturaPeso {
    constructor() {
        // Configuração inicial
        this.altura = 1.70; // metros
        this.peso = 70; // kg
        this.stBase = 10;
        this.inicializado = false;
        this.caracteristicasAtivas = []; // NOVO: Armazena características ativas

        // Tabelas GURPS para altura/peso baseado em ST
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
            15: { min: 1.93, max: 2.18 },
            16: { min: 2.00, max: 2.25 }
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

        // Inicializa quando a aba for carregada
        this.inicializarQuandoPronto();
    }

    inicializarQuandoPronto() {
        // Espera a aba de características ser carregada
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const tab = mutation.target;
                    if (tab.id === 'caracteristicas-tab' && tab.style.display !== 'none') {
                        setTimeout(() => {
                            if (!this.inicializado) {
                                this.inicializar();
                            }
                        }, 100);
                    }
                }
            });
        });

        const caracteristicasTab = document.getElementById('caracteristicas-tab');
        if (caracteristicasTab) {
            observer.observe(caracteristicasTab, { attributes: true });
        }
    }

    inicializar() {
        if (this.inicializado) return;
        
        console.log('📏 Sistema de Altura/Peso inicializando...');
        
        this.carregarDadosSalvos();
        this.configurarEventos();
        this.forcarAtualizacaoST();
        this.atualizarDisplay();
        
        // Adicionar botão de ajuste automático
        setTimeout(() => this.adicionarBotaoAjusteAutomatico(), 500);
        
        this.inicializado = true;
        
        console.log('✅ Sistema de Altura/Peso inicializado');
    }

    configurarEventos() {
        // Escuta mudanças nos atributos (ST)
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail && e.detail.ST !== undefined) {
                this.atualizarST(e.detail.ST);
            }
        });

        // Controles de altura
        const inputAltura = document.getElementById('alturaInput');
        if (inputAltura) {
            inputAltura.addEventListener('change', () => {
                let novaAltura = parseFloat(inputAltura.value);
                if (novaAltura < 1.20) novaAltura = 1.20;
                if (novaAltura > 2.50) novaAltura = 2.50;
                this.definirAltura(novaAltura);
            });
        }

        // Controles de peso
        const inputPeso = document.getElementById('pesoInput');
        if (inputPeso) {
            inputPeso.addEventListener('change', () => {
                let novoPeso = parseInt(inputPeso.value);
                if (novoPeso < 20) novoPeso = 20;
                if (novoPeso > 200) novoPeso = 200;
                this.definirPeso(novoPeso);
            });
        }

        // ===== NOVO: Escuta características físicas =====
        document.addEventListener('caracteristicasFisicasAlteradas', (e) => {
            if (e.detail && e.detail.caracteristicas) {
                this.caracteristicasAtivas = e.detail.caracteristicas;
                this.atualizarDisplay();
                this.atualizarFaixasBaseadoCaracteristicas();
            }
        });

        // Verificação periódica de ST
        this.iniciarVerificacaoPeriodica();
    }

    iniciarVerificacaoPeriodica() {
        setInterval(() => {
            const stAtual = this.obterSTReal();
            if (stAtual !== this.stBase) {
                this.atualizarST(stAtual);
            }
        }, 2000);
    }

    obterSTReal() {
        // Tenta obter do sistema de atributos
        if (typeof obterDadosAtributos === 'function') {
            try {
                const dados = obterDadosAtributos();
                if (dados.ST && dados.ST >= 1 && dados.ST <= 40) {
                    return dados.ST;
                }
            } catch (error) {
                console.warn('⚠️ Não foi possível obter ST do sistema de atributos:', error);
            }
        }

        // Fallback: input direto
        const inputST = document.getElementById('ST');
        if (inputST && inputST.value) {
            const st = parseInt(inputST.value);
            if (!isNaN(st) && st >= 1 && st <= 40) return st;
        }

        return 10; // Valor padrão
    }

    forcarAtualizacaoST() {
        const stReal = this.obterSTReal();
        if (stReal !== this.stBase) {
            this.atualizarST(stReal);
        }
    }

    atualizarST(novoST) {
        if (novoST === this.stBase) return;
        
        console.log(`🔄 ST atualizado: ${this.stBase} → ${novoST}`);
        this.stBase = novoST;
        this.atualizarDisplay();
        this.salvarDados();
    }

    // ===== MÉTODOS DE CONTROLE =====

    ajustarAltura(variacao) {
        let novaAltura = this.altura + variacao;
        
        // Limites básicos
        if (novaAltura < 1.20) novaAltura = 1.20;
        if (novaAltura > 2.50) novaAltura = 2.50;
        
        this.definirAltura(novaAltura);
    }

    definirAltura(novaAltura) {
        this.altura = parseFloat(novaAltura.toFixed(2));
        
        // Atualizar input
        const inputAltura = document.getElementById('alturaInput');
        if (inputAltura) {
            inputAltura.value = this.altura;
        }
        
        // Atualizar display
        const alturaValor = document.getElementById('alturaValor');
        if (alturaValor) {
            alturaValor.textContent = this.altura.toFixed(2);
        }
        
        this.atualizarDisplay();
        this.salvarDados();
    }

    ajustarPeso(variacao) {
        let novoPeso = this.peso + variacao;
        
        // Limites básicos
        if (novoPeso < 20) novoPeso = 20;
        if (novoPeso > 200) novoPeso = 200;
        
        this.definirPeso(novoPeso);
    }

    definirPeso(novoPeso) {
        this.peso = parseInt(novoPeso);
        
        // Atualizar input
        const inputPeso = document.getElementById('pesoInput');
        if (inputPeso) {
            inputPeso.value = this.peso;
        }
        
        // Atualizar display
        const pesoValor = document.getElementById('pesoValor');
        if (pesoValor) {
            pesoValor.textContent = this.peso;
        }
        
        this.atualizarDisplay();
        this.salvarDados();
    }

    // ===== NOVO: AJUSTE AUTOMÁTICO BASEADO EM CARACTERÍSTICAS =====
    ajustarPesoAutomaticamente() {
        const multiplicador = this.obterMultiplicadorPeso();
        
        if (multiplicador === 1.0) {
            this.mostrarMensagemTemporaria('Nenhuma característica ativa para ajuste', 'info');
            return;
        }
        
        // Calcula peso médio para o ST
        const faixaPeso = this.obterFaixaPeso(this.stBase);
        const pesoMedio = (faixaPeso.min + faixaPeso.max) / 2;
        
        // Aplica multiplicador da característica
        const novoPeso = Math.round(pesoMedio * multiplicador);
        
        // Limites de segurança
        const pesoFinal = Math.max(20, Math.min(200, novoPeso));
        
        // Define o novo peso
        this.definirPeso(pesoFinal);
        
        const nomeCarac = this.obterNomeCaracteristicaAtiva();
        this.mostrarMensagemTemporaria(`Peso ajustado para ${nomeCarac}: ${pesoFinal}kg`, 'sucesso');
    }
        // ===== CÁLCULOS E VERIFICAÇÕES =====

    obterFaixaAltura(st) {
        if (st >= 6 && st <= 16) {
            return this.alturaPorST[st];
        }
        
        // Extrapolação para ST fora da tabela
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
        
        return { min: 1.30, max: 2.50 }; // Fallback
    }

    obterFaixaPeso(st) {
        if (st >= 6 && st <= 16) {
            return this.pesoPorST[st];
        }
        
        // Extrapolação para ST fora da tabela
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
        
        return { min: 30, max: 200 }; // Fallback
    }

    // ===== NOVO: MÉTODOS PARA CARACTERÍSTICAS FÍSICAS =====
    obterMultiplicadorPeso() {
        if (!this.caracteristicasAtivas || this.caracteristicasAtivas.length === 0) {
            return 1.0;
        }
        
        // Procura características que afetam peso
        const caracteristicaPeso = this.caracteristicasAtivas.find(c => 
            c.tipo === 'magro' || 
            c.tipo === 'acima-peso' || 
            c.tipo === 'gordo' || 
            c.tipo === 'muito-gordo'
        );
        
        if (caracteristicaPeso) {
            switch(caracteristicaPeso.tipo) {
                case 'magro': return 0.67;
                case 'acima-peso': return 1.3;
                case 'gordo': return 1.5;
                case 'muito-gordo': return 2.0;
                default: return 1.0;
            }
        }
        
        return 1.0;
    }

    temNanismo() {
        if (!this.caracteristicasAtivas) return false;
        return this.caracteristicasAtivas.some(c => c.tipo === 'nanismo');
    }

    obterNomeCaracteristicaAtiva() {
        const multiplicador = this.obterMultiplicadorPeso();
        
        switch(multiplicador) {
            case 0.67: return 'Magro';
            case 1.3: return 'Acima do Peso';
            case 1.5: return 'Gordo';
            case 2.0: return 'Muito Gordo';
            default: 
                if (this.temNanismo()) return 'Nanismo';
                return 'Normal';
        }
    }

    atualizarFaixasBaseadoCaracteristicas() {
        const multiplicador = this.obterMultiplicadorPeso();
        const temNanismo = this.temNanismo();
        
        // Se tem nanismo, ajusta altura máxima
        if (temNanismo) {
            // Limitar altura se necessário
            if (this.altura > 1.32) {
                this.definirAltura(1.32);
                this.mostrarMensagemTemporaria('Altura ajustada para Nanismo (max 1.32m)', 'info');
            }
        }
        
        // Atualizar display com novas faixas
        this.atualizarDisplay();
    }

    verificarConformidade() {
        const faixaAltura = this.obterFaixaAltura(this.stBase);
        const faixaPeso = this.obterFaixaPeso(this.stBase);
        const multiplicador = this.obterMultiplicadorPeso();
        const temNanismo = this.temNanismo();
        
        // Ajusta faixa de peso pelo multiplicador
        const faixaPesoAjustada = {
            min: faixaPeso.min * multiplicador,
            max: faixaPeso.max * multiplicador
        };
        
        // Verifica altura (considera nanismo)
        let alturaValida;
        if (temNanismo) {
            alturaValida = this.altura <= 1.32; // Limite do nanismo
        } else {
            alturaValida = this.altura >= faixaAltura.min && this.altura <= faixaAltura.max;
        }
        
        // Verifica peso
        const pesoValido = this.peso >= faixaPesoAjustada.min && this.peso <= faixaPesoAjustada.max;
        
        return {
            alturaValida,
            pesoValido,
            faixaAltura,
            faixaPeso: faixaPesoAjustada,
            faixaPesoOriginal: faixaPeso,
            multiplicadorPeso: multiplicador,
            temNanismo,
            dentroDaFaixa: alturaValida && pesoValido
        };
    }

    // ===== ATUALIZAÇÃO DO DISPLAY =====

    atualizarDisplay() {
        const conformidade = this.verificarConformidade();
        
        this.atualizarStatusGeral(conformidade);
        this.atualizarStatusAltura(conformidade);
        this.atualizarStatusPeso(conformidade);
        this.atualizarInfoFisica(conformidade);
        this.atualizarDesvantagensAtivas();
    }

    atualizarStatusGeral(conformidade) {
        const statusFisico = document.getElementById('statusFisico');
        if (!statusFisico) return;

        if (conformidade.temNanismo) {
            statusFisico.textContent = "Nanismo";
            statusFisico.style.background = "#e74c3c";
            statusFisico.style.color = "white";
        } else if (conformidade.multiplicadorPeso !== 1.0) {
            const nomeCarac = this.obterNomeCaracteristicaAtiva();
            statusFisico.textContent = nomeCarac;
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

    atualizarStatusAltura(conformidade) {
        const statusAltura = document.getElementById('statusAltura');
        if (!statusAltura) return;

        let status, classe;
        
        if (conformidade.temNanismo) {
            status = `Nanismo: Altura ${this.altura.toFixed(2)}m (max: 1.32m)`;
            classe = "negativo";
        } else {
            if (conformidade.alturaValida) {
                status = `Dentro da faixa para ST ${this.stBase}`;
                classe = "positivo";
            } else if (this.altura < conformidade.faixaAltura.min) {
                status = `Abaixo do mínimo (${conformidade.faixaAltura.min}m)`;
                classe = "negativo";
            } else {
                status = `Acima do máximo (${conformidade.faixaAltura.max}m)`;
                classe = "negativo";
            }
        }

        statusAltura.textContent = status;
        statusAltura.className = `controle-faixa ${classe}`;
    }

        atualizarStatusPeso(conformidade) {
        const statusPeso = document.getElementById('statusPeso');
        if (!statusPeso) return;

        let status, classe;
        
        if (conformidade.multiplicadorPeso !== 1.0) {
            const nomeCarac = this.obterNomeCaracteristicaAtiva();
            if (conformidade.pesoValido) {
                status = `${nomeCarac}: Dentro da faixa ajustada`;
                classe = "positivo";
            } else if (this.peso < conformidade.faixaPeso.min) {
                status = `${nomeCarac}: Abaixo do mínimo (${conformidade.faixaPeso.min.toFixed(1)}kg)`;
                classe = "negativo";
            } else {
                status = `${nomeCarac}: Acima do máximo (${conformidade.faixaPeso.max.toFixed(1)}kg)`;
                classe = "negativo";
            }
        } else {
            if (conformidade.pesoValido) {
                status = `Dentro da faixa para ST ${this.stBase}`;
                classe = "positivo";
            } else if (this.peso < conformidade.faixaPeso.min) {
                status = `Abaixo do mínimo (${conformidade.faixaPeso.min.toFixed(1)}kg)`;
                classe = "negativo";
            } else {
                status = `Acima do máximo (${conformidade.faixaPeso.max.toFixed(1)}kg)`;
                classe = "negativo";
            }
        }

        statusPeso.textContent = status;
        statusPeso.className = `controle-faixa ${classe}`;
    }

    atualizarInfoFisica(conformidade) {
        // Atualizar ST atual
        const stAtual = document.getElementById('stAtual');
        if (stAtual) stAtual.textContent = this.stBase;
        
        const stBase = document.getElementById('stBase');
        if (stBase) stBase.textContent = this.stBase;

        // Atualizar faixa de altura
        const alturaFaixa = document.getElementById('alturaFaixa');
        if (alturaFaixa) {
            if (conformidade.temNanismo) {
                alturaFaixa.textContent = "1.32m (Nanismo)";
            } else {
                alturaFaixa.textContent = `${conformidade.faixaAltura.min}m - ${conformidade.faixaAltura.max}m`;
            }
        }

        // Atualizar faixa de peso
        const pesoFaixa = document.getElementById('pesoFaixa');
        if (pesoFaixa) {
            if (conformidade.multiplicadorPeso !== 1.0) {
                const nomeCarac = this.obterNomeCaracteristicaAtiva();
                pesoFaixa.textContent = `${conformidade.faixaPeso.min.toFixed(1)}kg - ${conformidade.faixaPeso.max.toFixed(1)}kg (${nomeCarac})`;
            } else {
                pesoFaixa.textContent = `${conformidade.faixaPesoOriginal.min}kg - ${conformidade.faixaPesoOriginal.max}kg`;
            }
        }
    }

    atualizarDesvantagensAtivas() {
        const container = document.getElementById('desvantagensAtivas');
        const lista = document.getElementById('listaDesvantagens');
        
        if (!container || !lista) return;
        
        const multiplicador = this.obterMultiplicadorPeso();
        const temNanismo = this.temNanismo();
        const temCaracteristicas = multiplicador !== 1.0 || temNanismo;
        
        if (!temCaracteristicas) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        
        let html = '';
        
        // Adicionar características de peso
        if (multiplicador !== 1.0) {
            let nome, efeito, pontos;
            
            switch(multiplicador) {
                case 0.67:
                    nome = 'Magro';
                    efeito = 'Peso = 2/3 do normal (×0.67)';
                    pontos = -5;
                    break;
                case 1.3:
                    nome = 'Acima do Peso';
                    efeito = 'Peso = 130% do normal (×1.3)';
                    pontos = -1;
                    break;
                case 1.5:
                    nome = 'Gordo';
                    efeito = 'Peso = 150% do normal (×1.5)';
                    pontos = -3;
                    break;
                case 2.0:
                    nome = 'Muito Gordo';
                    efeito = 'Peso dobrado (×2.0)';
                    pontos = -5;
                    break;
                default:
                    nome = 'Característica Ativa';
                    efeito = `Multiplicador: ${multiplicador}x`;
                    pontos = 0;
            }
            
            html += `
                <div class="desvantagem-item">
                    <div class="desvantagem-icone">⚖️</div>
                    <div class="desvantagem-info">
                        <strong>${nome}</strong>
                        <small>${efeito}</small>
                    </div>
                    <div class="desvantagem-pontos">
                        ${pontos >= 0 ? '+' : ''}${pontos}
                    </div>
                </div>
            `;
        }
        
        // Adicionar nanismo
        if (temNanismo) {
            html += `
                <div class="desvantagem-item">
                    <div class="desvantagem-icone">📏</div>
                    <div class="desvantagem-info">
                        <strong>Nanismo</strong>
                        <small>Altura máxima: 1.32m | MT -1, -1 Deslocamento</small>
                    </div>
                    <div class="desvantagem-pontos">
                        -15
                    </div>
                </div>
            `;
        }
        
        lista.innerHTML = html;
    }

    // ===== NOVO: BOTÃO DE AJUSTE AUTOMÁTICO =====
    adicionarBotaoAjusteAutomatico() {
        // Verificar se já existe o botão
        if (document.getElementById('btnAjusteAutomatico')) return;
        
        const card = document.querySelector('.altura-peso-card');
        if (!card) return;
        
        // Encontrar o container de desvantagens ou criar um novo local
        const infoFaixa = card.querySelector('.info-faixa');
        if (!infoFaixa) return;
        
        // Criar botão de ajuste automático
        const botaoDiv = document.createElement('div');
        botaoDiv.style.textAlign = 'center';
        botaoDiv.style.marginTop = '15px';
        botaoDiv.style.paddingTop = '15px';
        botaoDiv.style.borderTop = '1px solid rgba(212,175,55,0.3)';
        
        botaoDiv.innerHTML = `
            <button id="btnAjusteAutomatico" 
                    style="background: linear-gradient(145deg, var(--primary-gold), #b8941f);
                           color: var(--primary-dark);
                           border: 2px solid var(--secondary-gold);
                           border-radius: 6px;
                           padding: 8px 15px;
                           font-family: 'Cinzel', serif;
                           font-weight: bold;
                           cursor: pointer;
                           transition: all 0.3s ease;
                           display: flex;
                           align-items: center;
                           justify-content: center;
                           gap: 8px;
                           margin: 0 auto;">
                <i class="fas fa-cogs"></i> Ajustar Automaticamente
            </button>
            <div style="color: var(--wood-light); font-size: 0.85em; margin-top: 8px;">
                Baseado nas características selecionadas
            </div>
        `;
        
        // Inserir após info-faixa
        infoFaixa.parentNode.insertBefore(botaoDiv, infoFaixa.nextSibling);
        
        // Adicionar evento ao botão
        document.getElementById('btnAjusteAutomatico').addEventListener('click', () => {
            this.ajustarPesoAutomaticamente();
        });
    }

    mostrarMensagemTemporaria(mensagem, tipo) {
        const statusDiv = document.getElementById('statusFisico');
        if (!statusDiv) return;
        
        const originalTexto = statusDiv.textContent;
        const originalCor = statusDiv.style.background;
        const originalCorTexto = statusDiv.style.color;
        
        // Mudar temporariamente
        statusDiv.textContent = mensagem;
        statusDiv.style.background = tipo === 'sucesso' ? '#27ae60' : 
                                   tipo === 'erro' ? '#e74c3c' : '#f39c12';
        statusDiv.style.color = 'white';
        
        // Restaurar após 2 segundos
        setTimeout(() => {
            statusDiv.textContent = originalTexto;
            statusDiv.style.background = originalCor;
            statusDiv.style.color = originalCorTexto;
        }, 2000);
    }

    // ===== PERSISTÊNCIA =====

    carregarDadosSalvos() {
        try {
            const dadosSalvos = localStorage.getItem('sistemaAlturaPeso');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                if (dados.altura !== undefined) this.altura = dados.altura;
                if (dados.peso !== undefined) this.peso = dados.peso;
                if (dados.stBase !== undefined) this.stBase = dados.stBase;
                if (dados.caracteristicasAtivas !== undefined) {
                    this.caracteristicasAtivas = dados.caracteristicasAtivas;
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar dados salvos:', error);
        }
    }

    salvarDados() {
        try {
            const dadosParaSalvar = {
                altura: this.altura,
                peso: this.peso,
                stBase: this.stBase,
                caracteristicasAtivas: this.caracteristicasAtivas,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('sistemaAlturaPeso', JSON.stringify(dadosParaSalvar));
        } catch (error) {
            console.warn('⚠️ Erro ao salvar dados:', error);
        }
    }

    // ===== MÉTODOS PARA INTEGRAÇÃO =====

    exportarDados() {
        const conformidade = this.verificarConformidade();
        
        return {
            alturaPeso: {
                altura: this.altura,
                peso: this.peso,
                stBase: this.stBase,
                faixaAltura: conformidade.faixaAltura,
                faixaPeso: conformidade.faixaPeso,
                dentroDaFaixa: conformidade.dentroDaFaixa,
                multiplicadorPeso: conformidade.multiplicadorPeso,
                temNanismo: conformidade.temNanismo,
                caracteristicasAtivas: this.caracteristicasAtivas
            }
        };
    }

    carregarDados(dados) {
        if (dados.alturaPeso) {
            if (dados.alturaPeso.altura !== undefined) {
                this.definirAltura(dados.alturaPeso.altura);
            }
            if (dados.alturaPeso.peso !== undefined) {
                this.definirPeso(dados.alturaPeso.peso);
            }
            if (dados.alturaPeso.stBase !== undefined) {
                this.stBase = dados.alturaPeso.stBase;
            }
            if (dados.alturaPeso.caracteristicasAtivas !== undefined) {
                this.caracteristicasAtivas = dados.alturaPeso.caracteristicasAtivas;
            }
            this.atualizarDisplay();
            return true;
        }
        return false;
    }

    resetarParaPadrao() {
        this.altura = 1.70;
        this.peso = 70;
        this.stBase = 10;
        this.caracteristicasAtivas = [];
        
        const inputAltura = document.getElementById('alturaInput');
        if (inputAltura) inputAltura.value = '1.70';
        
        const inputPeso = document.getElementById('pesoInput');
        if (inputPeso) inputPeso.value = '70';
        
        this.atualizarDisplay();
        this.salvarDados();
        this.mostrarMensagemTemporaria('Dados resetados para padrão', 'sucesso');
    }

    validarAlturaPeso() {
        const conformidade = this.verificarConformidade();
        
        let mensagem = `Altura: ${this.altura.toFixed(2)}m, Peso: ${this.peso}kg`;
        
        if (conformidade.temNanismo) {
            mensagem += ' | Nanismo Ativo';
        } else if (conformidade.multiplicadorPeso !== 1.0) {
            mensagem += ` | ${this.obterNomeCaracteristicaAtiva()}`;
        }
        
        mensagem += ` | ST: ${this.stBase}`;
        
        if (!conformidade.dentroDaFaixa) {
            mensagem += ' | ⚠️ Fora da faixa recomendada';
        }
        
        return {
            valido: true,
            dentroDaFaixa: conformidade.dentroDaFaixa,
            mensagem: mensagem,
            detalhes: conformidade
        };
    }

    // ===== UTILITÁRIOS =====
    temGigantismo() {
        if (!this.caracteristicasAtivas) return false;
        return this.caracteristicasAtivas.some(c => c.tipo === 'gigantismo');
    }

    obterModificadores() {
        const modificadores = {};
        
        if (this.caracteristicasAtivas && this.caracteristicasAtivas.length > 0) {
            this.caracteristicasAtivas.forEach(carac => {
                if (carac.modificadores) {
                    Object.entries(carac.modificadores).forEach(([chave, valor]) => {
                        if (!modificadores[chave]) modificadores[chave] = 0;
                        modificadores[chave] += valor;
                    });
                }
            });
        }
        
        return modificadores;
    }
}

// ===== INICIALIZAÇÃO GLOBAL =====
let sistemaAlturaPeso;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    sistemaAlturaPeso = new SistemaAlturaPeso();
    
    // Também inicializar se a aba já estiver ativa
    const caracteristicasTab = document.getElementById('caracteristicas-tab');
    if (caracteristicasTab && caracteristicasTab.style.display !== 'none') {
        setTimeout(() => {
            if (sistemaAlturaPeso && !sistemaAlturaPeso.inicializado) {
                sistemaAlturaPeso.inicializar();
            }
        }, 300);
    }
});

// ===== FUNÇÕES GLOBAIS PARA CONTROLES =====
window.ajustarAltura = function(variacao) {
    if (sistemaAlturaPeso) {
        sistemaAlturaPeso.ajustarAltura(variacao);
    }
};

window.ajustarPeso = function(variacao) {
    if (sistemaAlturaPeso) {
        sistemaAlturaPeso.ajustarPeso(variacao);
    }
};

// ===== NOVA FUNÇÃO: AJUSTE AUTOMÁTICO =====
window.ajustarPesoAutomaticamente = function() {
    if (sistemaAlturaPeso) {
        sistemaAlturaPeso.ajustarPesoAutomaticamente();
    }
};

// ===== FUNÇÕES DE ACESSO =====
window.getDadosAlturaPeso = function() {
    return sistemaAlturaPeso ? sistemaAlturaPeso.exportarDados() : null;
};

window.validarAlturaPeso = function() {
    return sistemaAlturaPeso ? sistemaAlturaPeso.validarAlturaPeso() : { valido: false, mensagem: 'Sistema não inicializado' };
};

// ===== EXPORTAÇÃO =====
window.SistemaAlturaPeso = SistemaAlturaPeso;
window.sistemaAlturaPeso = sistemaAlturaPeso;

console.log('📦 Sistema de Altura/Peso carregado e pronto!');