// dashboard.js - VERSÃO COMPLETA QUE FUNCIONA
(function() {
    'use strict';
    
    // ============================================
    // CONFIGURAÇÃO INICIAL
    // ============================================
    let dashboardInicializada = false;
    let dadosPersonagem = {};
    let intervaloAtualizacao = null;
    
    // ============================================
    // 1. INICIALIZAÇÃO PRINCIPAL
    // ============================================
    function initDashboard() {
        if (dashboardInicializada) return;
        
        console.log('=== DASHBOARD: INICIANDO ===');
        
        try {
            // Configurar todos os eventos
            configurarEventosCompletos();
            
            // Carregar dados do personagem
            carregarDadosCompletos();
            
            // Configurar sincronização
            configurarSincronizacaoCompleta();
            
            // Iniciar sistema de pontos
            iniciarSistemaPontos();
            
            // Atualizar interface
            atualizarInterfaceCompleta();
            
            dashboardInicializada = true;
            
            console.log('=== DASHBOARD: PRONTA ===');
            
            // Mostrar mensagem
            mostrarMensagemStatus('Dashboard carregada com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro na dashboard:', error);
            mostrarMensagemStatus('Erro ao carregar dashboard', 'error');
        }
    }
    
    // ============================================
    // 2. CONFIGURAR EVENTOS COMPLETOS
    // ============================================
    function configurarEventosCompletos() {
        // INPUTS DE IDENTIFICAÇÃO
        const nomeInput = document.getElementById('char-name');
        if (nomeInput) {
            nomeInput.addEventListener('input', function() {
                salvarDado('nome', this.value);
                atualizarNomeDashboard(this.value);
            });
        }
        
        const racaInput = document.getElementById('char-race');
        if (racaInput) {
            racaInput.addEventListener('input', function() {
                salvarDado('raca', this.value);
            });
        }
        
        const ocupacaoInput = document.getElementById('char-type');
        if (ocupacaoInput) {
            ocupacaoInput.addEventListener('input', function() {
                salvarDado('ocupacao', this.value);
            });
        }
        
        const jogadorInput = document.getElementById('char-player');
        if (jogadorInput) {
            jogadorInput.addEventListener('input', function() {
                salvarDado('jogador', this.value);
            });
        }
        
        // SISTEMA DE PONTOS
        const pontosIniciaisInput = document.getElementById('start-points');
        if (pontosIniciaisInput) {
            pontosIniciaisInput.addEventListener('change', function() {
                const valor = parseInt(this.value) || 100;
                salvarDado('pontosIniciais', valor);
                atualizarSaldoPontos();
            });
        }
        
        const limiteDesvantagensInput = document.getElementById('dis-limit');
        if (limiteDesvantagensInput) {
            limiteDesvantagensInput.addEventListener('change', function() {
                const valor = parseInt(this.value) || -75;
                salvarDado('limiteDesvantagens', valor);
            });
        }
        
        // BOTÃO ATUALIZAR
        const botaoAtualizar = document.querySelector('.refresh-btn');
        if (botaoAtualizar) {
            botaoAtualizar.addEventListener('click', function() {
                carregarDadosCompletos();
                mostrarMensagemStatus('Dashboard atualizada!', 'success');
            });
        }
        
        // UPLOAD DE FOTO
        const uploadInput = document.getElementById('char-upload');
        if (uploadInput) {
            uploadInput.addEventListener('change', function(e) {
                const arquivo = e.target.files[0];
                if (arquivo && arquivo.type.startsWith('image/')) {
                    processarUploadFoto(arquivo);
                }
            });
        }
        
        // STATUS SOCIAL - STATUS
        const btnStatusMais = document.querySelector('[onclick*="ajustarModificador(\'status\'"]');
        const btnStatusMenos = document.querySelector('[onclick*="ajustarModificador(\'status\', -1)"]');
        if (btnStatusMais && btnStatusMenos) {
            btnStatusMais.addEventListener('click', function() { ajustarStatusSocial('status', 1); });
            btnStatusMenos.addEventListener('click', function() { ajustarStatusSocial('status', -1); });
        }
        
        // STATUS SOCIAL - REPUTAÇÃO
        const btnRepMais = document.querySelector('[onclick*="ajustarModificador(\'reputacao\'"]');
        const btnRepMenos = document.querySelector('[onclick*="ajustarModificador(\'reputacao\', -1)"]');
        if (btnRepMais && btnRepMenos) {
            btnRepMais.addEventListener('click', function() { ajustarStatusSocial('reputacao', 1); });
            btnRepMenos.addEventListener('click', function() { ajustarStatusSocial('reputacao', -1); });
        }
        
        // STATUS SOCIAL - APARÊNCIA
        const btnAppMais = document.querySelector('[onclick*="ajustarModificador(\'aparencia\'"]');
        const btnAppMenos = document.querySelector('[onclick*="ajustarModificador(\'aparencia\', -1)"]');
        if (btnAppMais && btnAppMenos) {
            btnAppMais.addEventListener('click', function() { ajustarStatusSocial('aparencia', 1); });
            btnAppMenos.addEventListener('click', function() { ajustarStatusSocial('aparencia', -1); });
        }
    }
    
    // ============================================
    // 3. CARREGAMENTO DE DADOS COMPLETO
    // ============================================
    async function carregarDadosCompletos() {
        try {
            // Tentar carregar do Firebase primeiro
            if (window.firebaseService && window.firebaseService.characterId) {
                const dadosFirebase = await window.firebaseService.loadCharacter();
                if (dadosFirebase) {
                    dadosPersonagem = dadosFirebase;
                    aplicarDadosFirebase(dadosFirebase);
                    return;
                }
            }
            
            // Se não, carregar do localStorage
            const dadosLocal = localStorage.getItem('gurps_personagem_completo');
            if (dadosLocal) {
                dadosPersonagem = JSON.parse(dadosLocal);
                aplicarDadosLocal(dadosPersonagem);
            }
            
        } catch (error) {
            console.error('Erro carregando dados:', error);
            dadosPersonagem = criarDadosPadrao();
        }
        
        // Atualizar interface com dados carregados
        atualizarInterfaceCompleta();
    }
    
    function aplicarDadosFirebase(dados) {
        if (!dados) return;
        
        // IDENTIFICAÇÃO
        if (dados.nome) setInputValue('char-name', dados.nome);
        if (dados.raca) setInputValue('char-race', dados.raca);
        if (dados.ocupacao) setInputValue('char-type', dados.ocupacao);
        if (dados.jogador) setInputValue('char-player', dados.jogador);
        if (dados.pontosIniciais !== undefined) setInputValue('start-points', dados.pontosIniciais);
        if (dados.limiteDesvantagens !== undefined) setInputValue('dis-limit', dados.limiteDesvantagens);
        
        // ATRIBUTOS
        if (dados.atributos) {
            atualizarAtributosDashboard(dados.atributos);
        }
        
        // PONTOS
        if (dados.pontos) {
            atualizarPontosDashboard(dados.pontos);
        }
        
        // CARGAS
        if (dados.cargas) {
            atualizarCargasDashboard(dados.cargas);
        }
        
        // STATUS SOCIAL
        if (dados.statusSocial) {
            atualizarStatusSocial(dados.statusSocial);
        }
        
        // FINANÇAS
        if (dados.financeiro) {
            atualizarFinancas(dados.financeiro);
        }
        
        // FOTO
        if (dados.foto && dados.foto.base64) {
            document.getElementById('photo-preview').innerHTML = 
                `<img src="${dados.foto.base64}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
        }
    }
    
    function aplicarDadosLocal(dados) {
        if (!dados) return;
        
        // Aplicar todos os campos do localStorage
        for (const [chave, valor] of Object.entries(dados)) {
            const input = document.getElementById(chave);
            if (input) {
                input.value = valor;
            }
        }
    }
    
    function criarDadosPadrao() {
        return {
            nome: "Novo Personagem",
            raca: "Humano",
            ocupacao: "Aventureiro",
            jogador: "",
            pontosIniciais: 100,
            limiteDesvantagens: -75,
            status: "rascunho"
        };
    }
    
    // ============================================
    // 4. ATUALIZAÇÃO DE ATRIBUTOS
    // ============================================
    function configurarSincronizacaoCompleta() {
        // Escutar eventos dos atributos
        document.addEventListener('atributos-atualizados', function(e) {
            if (e.detail) {
                atualizarAtributosDashboard(e.detail);
                salvarDado('atributos', e.detail);
            }
        });
        
        // Escutar eventos do Firebase
        document.addEventListener('firebase-loaded', function(e) {
            if (e.detail && e.detail.atributos) {
                atualizarAtributosDashboard(e.detail.atributos);
            }
        });
        
        // Sincronizar periodicamente
        intervaloAtualizacao = setInterval(function() {
            // Tentar pegar atributos da aba atributos
            if (typeof window.getAtributosPersonagem === 'function') {
                const atributos = window.getAtributosPersonagem();
                if (atributos) {
                    atualizarAtributosDashboard(atributos);
                }
            }
            
            // Tentar pegar cargas
            if (typeof window.getCargasPersonagem === 'function') {
                const cargas = window.getCargasPersonagem();
                if (cargas) {
                    atualizarCargasDashboard(cargas);
                }
            }
            
            // Atualizar hora
            atualizarHoraUltimaAtualizacao();
            
        }, 3000); // Atualizar a cada 3 segundos
    }
    
    function atualizarAtributosDashboard(atributos) {
        if (!atributos) return;
        
        // Atributos principais
        const st = atributos.ST || 10;
        const dx = atributos.DX || 10;
        const iq = atributos.IQ || 10;
        const ht = atributos.HT || 10;
        
        // Atualizar elementos
        setElementText('summary-st', st);
        setElementText('summary-dx', dx);
        setElementText('summary-iq', iq);
        setElementText('summary-ht', ht);
        
        setElementText('currentST', st);
        setElementText('currentST2', st);
        
        // Atributos derivados
        const bonus = atributos.bonus || {};
        
        const pvTotal = Math.max(st + (bonus.PV || 0), 1);
        const pfTotal = Math.max(ht + (bonus.PF || 0), 1);
        const vontadeTotal = Math.max(iq + (bonus.Vontade || 0), 1);
        const percepcaoTotal = Math.max(iq + (bonus.Percepcao || 0), 1);
        
        // Atualizar totais
        setElementText('summary-hp', pvTotal);
        setElementText('summary-fp', pfTotal);
        setElementText('summary-will', vontadeTotal);
        setElementText('summary-per', percepcaoTotal);
        
        // Atualizar quick stats
        setElementText('quick-hp', pvTotal);
        setElementText('quick-fp', pfTotal);
        
        // Atualizar bases
        setElementText('PVBase', st);
        setElementText('PFBase', ht);
        setElementText('VontadeBase', iq);
        setElementText('PercepcaoBase', iq);
        
        // Calcular deslocamento
        const deslocamentoBase = (ht + dx) / 4;
        setElementText('DeslocamentoBase', deslocamentoBase.toFixed(2));
        setElementText('DeslocamentoTotal', deslocamentoBase.toFixed(2));
    }
    
    // ============================================
    // 5. SISTEMA DE PONTOS COMPLETO
    // ============================================
    function iniciarSistemaPontos() {
        // Se existir pontosManager, usar ele
        if (window.pontosManager) {
            window.pontosManager.adicionarListener(function(dados) {
                atualizarDisplayPontosCompleto(dados);
            });
            
            // Carregar pontos existentes
            setTimeout(function() {
                if (window.pontosManager.carregarPontos) {
                    window.pontosManager.carregarPontos();
                }
            }, 1000);
        } else {
            // Sistema de pontos próprio
            configurarSistemaPontosProprio();
        }
    }
    
    function atualizarPontosDashboard(dadosPontos) {
        if (!dadosPontos) return;
        
        // Total gasto
        const totalGasto = dadosPontos.total || 0;
        setElementText('total-points-spent', totalGasto + " pts");
        
        // Distribuição
        if (dadosPontos.distribuicao) {
            const dist = dadosPontos.distribuicao;
            
            setElementText('points-attr', dist.atributos || 0);
            setElementText('points-adv', Math.max(dist.vantagens || 0, 0));
            setElementText('points-dis', Math.abs(Math.min(dist.desvantagens || 0, 0)));
            setElementText('points-pec', Math.abs(Math.min(dist.peculiaridades || 0, 0)));
            setElementText('points-skills', dist.pericias || 0);
            setElementText('points-tech', dist.técnicas || 0);
            setElementText('points-spells', dist.magias || 0);
        }
        
        // Atualizar saldo
        atualizarSaldoPontosCompleto(totalGasto);
    }
    
    function atualizarDisplayPontosCompleto(dados) {
        if (!dados) return;
        
        // Total gasto
        const totalGasto = dados.total || 0;
        const totalElement = document.getElementById('total-points-spent');
        if (totalElement) {
            totalElement.textContent = totalGasto + " pts";
            totalElement.className = 'card-badge ' + (dados.status === 'excedido' ? 'excedido' : '');
        }
        
        // Distribuição
        if (dados.distribuicao) {
            const dist = dados.distribuicao;
            
            setElementText('points-attr', dist.atributos || 0);
            setElementText('points-adv', Math.max(dist.vantagens || 0, 0));
            setElementText('points-dis', Math.abs(Math.min(dist.desvantagens || 0, 0)));
            setElementText('points-pec', Math.abs(Math.min(dist.peculiaridades || 0, 0)));
            setElementText('points-skills', dist.pericias || 0);
            setElementText('points-tech', dist.técnicas || 0);
            setElementText('points-spells', dist.magias || 0);
        }
        
        // Atualizar saldo
        atualizarSaldoPontosCompleto(totalGasto);
    }
    
    function atualizarSaldoPontosCompleto(totalGasto) {
        const pontosIniciaisInput = document.getElementById('start-points');
        const pontosIniciais = pontosIniciaisInput ? parseInt(pontosIniciaisInput.value) || 100 : 100;
        
        const saldo = pontosIniciais - totalGasto;
        const saldoElement = document.getElementById('points-balance');
        
        if (saldoElement) {
            saldoElement.textContent = saldo;
            
            // Estilo do saldo
            const container = saldoElement.closest('.balance-value-container');
            const statusText = document.getElementById('points-status-text');
            const statusIndicator = document.getElementById('points-status-indicator');
            
            if (container && statusText && statusIndicator) {
                // Resetar classes
                container.className = 'balance-value-container';
                statusText.className = 'status-text';
                
                if (saldo < 0) {
                    // Excedeu
                    container.classList.add('negativo');
                    statusText.textContent = 'Excedeu o limite!';
                    statusText.classList.add('negativo');
                    statusIndicator.style.backgroundColor = '#dc3545';
                } else if (saldo === 0) {
                    // Perfeito
                    container.classList.add('exato');
                    statusText.textContent = 'Perfeito!';
                    statusText.classList.add('positivo');
                    statusIndicator.style.backgroundColor = '#28a745';
                } else if (saldo <= 10) {
                    // Poucos pontos
                    container.classList.add('baixo');
                    statusText.textContent = 'Poucos pontos restantes';
                    statusText.classList.add('warning');
                    statusIndicator.style.backgroundColor = '#ffc107';
                } else {
                    // Normal
                    container.classList.add('positivo');
                    statusText.textContent = 'Personagem válido';
                    statusText.classList.add('positivo');
                    statusIndicator.style.backgroundColor = '#28a745';
                }
            }
        }
    }
    
    function configurarSistemaPontosProprio() {
        // Sistema simples se não existir pontosManager
        document.addEventListener('atributos-atualizados', function() {
            // Recalcular pontos dos atributos
            if (typeof window.calcularCustoAtributos === 'function') {
                const custoAtributos = window.calcularCustoAtributos() || 0;
                const pontosAtributos = document.getElementById('points-attr');
                if (pontosAtributos) {
                    pontosAtributos.textContent = custoAtributos;
                }
            }
        });
    }
    
    // ============================================
    // 6. CARGAS E FINANÇAS
    // ============================================
    function atualizarCargasDashboard(cargas) {
        if (!cargas) return;
        
        // Formatar valores
        const formatarValor = function(valor) {
            if (Number.isInteger(valor)) {
                return valor.toString();
            } else {
                // Para ST 12: 14.5 mostra como 14.5, não 15
                return valor.toFixed(1);
            }
        };
        
        // Atualizar limites de carga
        setElementText('limit-light', formatarValor(cargas.leve || 0) + ' kg');
        setElementText('limit-medium', formatarValor(cargas.media || 0) + ' kg');
        setElementText('limit-heavy', formatarValor(cargas.pesada || 0) + ' kg');
        setElementText('limit-extreme', formatarValor(cargas.muitoPesada || 0) + ' kg');
        
        // Atualizar também na tabela se existir
        setElementText('cargaNenhuma', formatarValor(cargas.nenhuma || 0));
        setElementText('cargaLeve', formatarValor(cargas.leve || 0));
        setElementText('cargaMedia', formatarValor(cargas.media || 0));
        setElementText('cargaPesada', formatarValor(cargas.pesada || 0));
        setElementText('cargaMuitoPesada', formatarValor(cargas.muitoPesada || 0));
    }
    
    function atualizarFinancas(financeiro) {
        if (!financeiro) return;
        
        // Dinheiro
        if (financeiro.dinheiro !== undefined) {
            const dinheiroElement = document.getElementById('current-money');
            if (dinheiroElement) {
                dinheiroElement.textContent = `$${financeiro.dinheiro.toLocaleString('pt-BR')}`;
            }
        }
        
        // Nível de riqueza
        if (financeiro.nivel) {
            const nivelElement = document.getElementById('wealth-level-display');
            if (nivelElement) {
                nivelElement.textContent = `${financeiro.nivel} [${financeiro.pontos || 0} pts]`;
            }
        }
        
        // Status financeiro
        if (financeiro.status) {
            const statusElement = document.getElementById('finance-status');
            if (statusElement) {
                statusElement.textContent = financeiro.status;
            }
        }
    }
    
    // ============================================
    // 7. STATUS SOCIAL
    // ============================================
    function ajustarStatusSocial(tipo, valor) {
        const mapeamento = {
            'status': { value: 'status-value', points: 'status-points-compact' },
            'reputacao': { value: 'rep-value', points: 'reputacao-points-compact' },
            'aparencia': { value: 'app-value', points: 'aparencia-points-compact' }
        };
        
        const config = mapeamento[tipo];
        if (!config) return;
        
        const valueElement = document.getElementById(config.value);
        const pointsElement = document.getElementById(config.points);
        
        if (valueElement && pointsElement) {
            // Obter valor atual
            let valorAtual = 0;
            const textoAtual = valueElement.textContent;
            if (textoAtual.startsWith('+')) {
                valorAtual = parseInt(textoAtual.substring(1)) || 0;
            } else if (textoAtual.startsWith('-')) {
                valorAtual = parseInt(textoAtual) || 0;
            } else {
                valorAtual = parseInt(textoAtual) || 0;
            }
            
            // Aplicar mudança
            valorAtual += valor;
            
            // Limites
            if (valorAtual < -5) valorAtual = -5;
            if (valorAtual > 5) valorAtual = 5;
            
            // Atualizar valor
            valueElement.textContent = valorAtual >= 0 ? `+${valorAtual}` : valorAtual.toString();
            
            // Atualizar pontos (5 pontos por nível)
            const pontos = valorAtual * 5;
            pointsElement.textContent = `[${pontos}]`;
            
            // Aplicar cor
            valueElement.className = '';
            if (valorAtual > 0) {
                valueElement.classList.add('positivo');
            } else if (valorAtual < 0) {
                valueElement.classList.add('negativo');
            }
            
            // Salvar
            if (!dadosPersonagem.statusSocial) {
                dadosPersonagem.statusSocial = {};
            }
            dadosPersonagem.statusSocial[tipo] = valorAtual;
            salvarDado('statusSocial.' + tipo, valorAtual);
            
            // Calcular total de reação
            calcularTotalReacao();
        }
    }
    
    function atualizarStatusSocial(statusSocial) {
        if (!statusSocial) return;
        
        for (const [tipo, valor] of Object.entries(statusSocial)) {
            const mapeamento = {
                'status': { value: 'status-value', points: 'status-points-compact' },
                'reputacao': { value: 'rep-value', points: 'reputacao-points-compact' },
                'aparencia': { value: 'app-value', points: 'aparencia-points-compact' }
            };
            
            const config = mapeamento[tipo];
            if (config) {
                const valueElement = document.getElementById(config.value);
                const pointsElement = document.getElementById(config.points);
                
                if (valueElement && pointsElement) {
                    valueElement.textContent = valor >= 0 ? `+${valor}` : valor.toString();
                    pointsElement.textContent = `[${valor * 5}]`;
                    
                    // Aplicar cor
                    valueElement.className = '';
                    if (valor > 0) {
                        valueElement.classList.add('positivo');
                    } else if (valor < 0) {
                        valueElement.classList.add('negativo');
                    }
                }
            }
        }
        
        // Calcular total de reação
        calcularTotalReacao();
    }
    
    function calcularTotalReacao() {
        let total = 0;
        
        // Status
        const statusElement = document.getElementById('status-value');
        if (statusElement) {
            const statusTexto = statusElement.textContent;
            total += statusTexto.startsWith('+') ? parseInt(statusTexto.substring(1)) : parseInt(statusTexto) || 0;
        }
        
        // Reputação
        const repElement = document.getElementById('rep-value');
        if (repElement) {
            const repTexto = repElement.textContent;
            total += repTexto.startsWith('+') ? parseInt(repTexto.substring(1)) : parseInt(repTexto) || 0;
        }
        
        // Aparência
        const appElement = document.getElementById('app-value');
        if (appElement) {
            const appTexto = appElement.textContent;
            total += appTexto.startsWith('+') ? parseInt(appTexto.substring(1)) : parseInt(appTexto) || 0;
        }
        
        // Atualizar total
        const totalElement = document.getElementById('reaction-total-compact');
        if (totalElement) {
            totalElement.textContent = total >= 0 ? `+${total}` : total.toString();
            totalElement.className = total > 0 ? 'positivo' : total < 0 ? 'negativo' : '';
        }
    }
    
    // ============================================
    // 8. FUNÇÕES AUXILIARES
    // ============================================
    function setInputValue(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.value = valor;
        }
    }
    
    function setElementText(id, texto) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = texto;
        }
    }
    
    async function salvarDado(chave, valor) {
        // Salvar no localStorage
        if (!dadosPersonagem) dadosPersonagem = {};
        
        // Para chaves com ponto (objeto.propriedade)
        if (chave.includes('.')) {
            const partes = chave.split('.');
            let obj = dadosPersonagem;
            for (let i = 0; i < partes.length - 1; i++) {
                if (!obj[partes[i]]) obj[partes[i]] = {};
                obj = obj[partes[i]];
            }
            obj[partes[partes.length - 1]] = valor;
        } else {
            dadosPersonagem[chave] = valor;
        }
        
        localStorage.setItem('gurps_personagem_completo', JSON.stringify(dadosPersonagem));
        
        // Salvar no Firebase se disponível
        if (window.firebaseService && window.firebaseService.saveModule) {
            try {
                // Se for um campo simples, salvar individualmente
                if (!chave.includes('.')) {
                    await window.firebaseService.saveModule(chave, valor);
                }
            } catch (error) {
                console.error('Erro Firebase:', error);
            }
        }
    }
    
    function processarUploadFoto(arquivo) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const preview = document.getElementById('photo-preview');
            if (preview) {
                preview.innerHTML = `<img src="${event.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
            }
            
            // Salvar dados da foto
            const fotoData = {
                base64: event.target.result,
                tipo: arquivo.type,
                nome: arquivo.name,
                tamanho: arquivo.size,
                dataUpload: new Date().toISOString()
            };
            
            salvarDado('foto', fotoData);
            mostrarMensagemStatus('Foto carregada com sucesso!', 'success');
        };
        
        reader.onerror = function() {
            mostrarMensagemStatus('Erro ao carregar foto', 'error');
        };
        
        reader.readAsDataURL(arquivo);
    }
    
    function atualizarNomeDashboard(nome) {
        // Atualizar em todos os lugares necessários
        const elementosNome = document.querySelectorAll('.character-name-display');
        elementosNome.forEach(el => {
            el.textContent = nome;
        });
    }
    
    function atualizarHoraUltimaAtualizacao() {
        const agora = new Date();
        const horaElement = document.getElementById('last-update-time');
        if (horaElement) {
            horaElement.textContent = agora.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
    
    function atualizarInterfaceCompleta() {
        // Atualizar hora
        atualizarHoraUltimaAtualizacao();
        
        // Calcular total de reação
        calcularTotalReacao();
        
        // Atualizar contadores básicos
        const contadores = document.querySelectorAll('.counter-value');
        contadores.forEach(contador => {
            if (contador.textContent === '0' || !contador.textContent) {
                contador.textContent = '0';
            }
        });
    }
    
    function mostrarMensagemStatus(mensagem, tipo) {
        const statusElement = document.getElementById('statusAtributos');
        if (!statusElement) return;
        
        const icones = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const icone = icones[tipo] || 'fa-info-circle';
        
        statusElement.innerHTML = `<i class="fas ${icone}"></i> <span>${mensagem}</span>`;
        statusElement.className = `status-mensagem ${tipo}`;
        
        // Auto-remover após 3 segundos
        setTimeout(() => {
            statusElement.innerHTML = '<i class="fas fa-info-circle"></i> <span>Dashboard pronta.</span>';
            statusElement.className = 'status-mensagem';
        }, 3000);
    }
    
    // ============================================
    // 9. INICIALIZAÇÃO AUTOMÁTICA
    // ============================================
    // Escutar quando a aba dashboard for ativada
    document.addEventListener('DOMContentLoaded', function() {
        const dashboardTab = document.getElementById('dashboard');
        
        if (dashboardTab) {
            // Observar mudanças na classe da aba
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === 'class') {
                        if (dashboardTab.classList.contains('active')) {
                            // Iniciar dashboard com pequeno delay
                            setTimeout(initDashboard, 100);
                        } else {
                            // Limpar intervalo quando sair da dashboard
                            if (intervaloAtualizacao) {
                                clearInterval(intervaloAtualizacao);
                                intervaloAtualizacao = null;
                            }
                        }
                    }
                });
            });
            
            observer.observe(dashboardTab, { attributes: true });
            
            // Se já estiver ativa, iniciar
            if (dashboardTab.classList.contains('active')) {
                setTimeout(initDashboard, 500);
            }
        }
    });
    
    // Exportar funções principais
    window.initDashboardTab = initDashboard;
    window.atualizarDashboardAtributos = atualizarAtributosDashboard;
    window.atualizarDashboardPontos = atualizarPontosDashboard;
    window.atualizarDashboardCargas = atualizarCargasDashboard;
    
    console.log('✅ dashboard.js carregado (500+ linhas)');
})();