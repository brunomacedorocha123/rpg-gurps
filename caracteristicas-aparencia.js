// ===========================================
// SISTEMA DE APARÊNCIA - CARACTERÍSTICAS
// VERSÃO SIMPLES E FUNCIONAL
// ===========================================

(function() {
    console.log('🎭 Iniciando Sistema de Aparência (Características)...');
    
    // Esperar o DOM carregar completamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAparencia);
    } else {
        setTimeout(initAparencia, 300);
    }
    
    function initAparencia() {
        console.log('🔧 Configurando aparência...');
        
        // Dados dos níveis de aparência
        const niveisAparencia = {
            '-24': { nome: 'Horrendo', pontos: -24, reacao: -6 },
            '-20': { nome: 'Monstruoso', pontos: -20, reacao: -5 },
            '-16': { nome: 'Hediondo', pontos: -16, reacao: -4 },
            '-8': { nome: 'Feio', pontos: -8, reacao: -2 },
            '-4': { nome: 'Sem Atrativos', pontos: -4, reacao: -1 },
            '0': { nome: 'Comum', pontos: 0, reacao: 0 },
            '4': { nome: 'Atraente', pontos: 4, reacao: 1 },
            '12': { nome: 'Elegante', pontos: 12, reacao: { mesmo: 2, outro: 4 } },
            '16': { nome: 'Muito Elegante', pontos: 16, reacao: { mesmo: 2, outro: 6 } },
            '20': { nome: 'Lindo', pontos: 20, reacao: { mesmo: 2, outro: 8 } }
        };
        
        // Elementos
        const selectAparencia = document.getElementById('nivelAparencia');
        const badgePontos = document.getElementById('pontosAparencia');
        const displayInfo = document.getElementById('displayAparencia');
        const resumoAparencia = document.getElementById('resumoAparencia');
        const totalSecao1 = document.getElementById('totalSecao1');
        
        // Verificar se os elementos existem
        if (!selectAparencia || !badgePontos || !displayInfo || !resumoAparencia || !totalSecao1) {
            console.error('❌ Elementos da aparência não encontrados!');
            console.log('Procurando:', {
                select: !!selectAparencia,
                badge: !!badgePontos,
                display: !!displayInfo,
                resumo: !!resumoAparencia,
                total: !!totalSecao1
            });
            return;
        }
        
        console.log('✅ Todos elementos encontrados!');
        
        // Função para atualizar tudo
        function atualizarAparencia() {
            const valor = selectAparencia.value;
            const dados = niveisAparencia[valor];
            
            if (!dados) {
                console.error('Dados não encontrados para valor:', valor);
                return;
            }
            
            console.log('📊 Atualizando para:', dados.nome, dados.pontos + 'pts');
            
            // 1. Atualizar badge de pontos
            atualizarBadge(dados.pontos);
            
            // 2. Atualizar display de informações
            atualizarDisplay(dados);
            
            // 3. Atualizar resumo
            atualizarResumo(dados.pontos);
            
            // 4. Atualizar total da seção
            atualizarTotalSecao(dados.pontos);
            
            // 5. Disparar evento
            dispararEventoAtualizacao(dados);
        }
        
        function atualizarBadge(pontos) {
            const texto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
            badgePontos.textContent = texto;
            
            // Cor baseada nos pontos
            if (pontos > 0) {
                badgePontos.style.background = 'linear-gradient(145deg, #2e5c3a, #27ae60)';
                badgePontos.style.color = 'white';
                badgePontos.style.border = '1px solid #27ae60';
            } else if (pontos < 0) {
                badgePontos.style.background = 'linear-gradient(145deg, #8b0000, #e74c3c)';
                badgePontos.style.color = 'white';
                badgePontos.style.border = '1px solid #e74c3c';
            } else {
                badgePontos.style.background = 'linear-gradient(145deg, #D4AF37, #FFD700)';
                badgePontos.style.color = '#1a1200';
                badgePontos.style.border = '1px solid #D4AF37';
            }
        }
        
        function atualizarDisplay(dados) {
            // Formatar texto da reação
            let textoReacao = '';
            if (typeof dados.reacao === 'object') {
                textoReacao = `Reação: +${dados.reacao.mesmo} (mesmo sexo), +${dados.reacao.outro} (outro sexo)`;
            } else {
                const sinal = dados.reacao >= 0 ? '+' : '';
                textoReacao = `Reação: ${sinal}${dados.reacao}`;
            }
            
            // Criar HTML do display
            displayInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="
                        background: ${dados.pontos > 0 ? '#27ae60' : dados.pontos < 0 ? '#e74c3c' : '#D4AF37'};
                        color: ${dados.pontos === 0 ? '#1a1200' : 'white'};
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 0.9rem;
                        flex-shrink: 0;
                    ">
                        ${dados.pontos >= 0 ? '+' : ''}${dados.pontos}
                    </div>
                    <div>
                        <strong style="
                            color: ${dados.pontos > 0 ? '#27ae60' : dados.pontos < 0 ? '#e74c3c' : '#D4AF37'};
                            font-size: 1.1rem;
                            display: block;
                            margin-bottom: 2px;
                        ">
                            ${dados.nome}
                        </strong>
                        <small style="color: white; opacity: 0.9; font-size: 0.9rem;">
                            ${textoReacao}
                        </small>
                    </div>
                </div>
            `;
        }
        
        function atualizarResumo(pontos) {
            const texto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
            resumoAparencia.textContent = texto;
            
            if (pontos > 0) {
                resumoAparencia.style.color = '#27ae60';
                resumoAparencia.style.fontWeight = 'bold';
            } else if (pontos < 0) {
                resumoAparencia.style.color = '#e74c3c';
                resumoAparencia.style.fontWeight = 'bold';
            } else {
                resumoAparencia.style.color = '#D4AF37';
                resumoAparencia.style.fontWeight = 'normal';
            }
        }
        
        function atualizarTotalSecao(pontos) {
            const texto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
            totalSecao1.textContent = texto;
            
            if (pontos > 0) {
                totalSecao1.style.background = 'rgba(46, 92, 58, 0.8)';
                totalSecao1.style.color = 'white';
                totalSecao1.style.border = '1px solid #27ae60';
            } else if (pontos < 0) {
                totalSecao1.style.background = 'rgba(139, 0, 0, 0.8)';
                totalSecao1.style.color = 'white';
                totalSecao1.style.border = '1px solid #e74c3c';
            } else {
                totalSecao1.style.background = 'rgba(212, 175, 55, 0.1)';
                totalSecao1.style.color = '#D4AF37';
                totalSecao1.style.border = '1px solid rgba(212, 175, 55, 0.3)';
            }
        }
        
        function dispararEventoAtualizacao(dados) {
            const evento = new CustomEvent('caracteristicaAparenciaAtualizada', {
                detail: {
                    nome: dados.nome,
                    pontos: dados.pontos,
                    reacao: dados.reacao
                }
            });
            document.dispatchEvent(evento);
            
            console.log('📡 Evento disparado:', dados.nome);
        }
        
        // Configurar evento no select
        selectAparencia.addEventListener('change', atualizarAparencia);
        
        // Atualizar inicialmente
        setTimeout(() => {
            console.log('🚀 Primeira atualização...');
            atualizarAparencia();
        }, 100);
        
        // Expor funções para debug
        window.aparenciaDebug = {
            atualizar: atualizarAparencia,
            getValor: () => selectAparencia.value,
            getDados: () => niveisAparencia[selectAparencia.value],
            testar: () => {
                console.log('🧪 Testando todos os níveis...');
                const valores = Object.keys(niveisAparencia);
                valores.forEach(valor => {
                    selectAparencia.value = valor;
                    atualizarAparencia();
                    console.log('Testado:', niveisAparencia[valor].nome);
                });
                // Voltar ao normal
                selectAparencia.value = '0';
                atualizarAparencia();
            }
        };
        
        console.log('✅ Sistema de Aparência configurado!');
        console.log('📝 Comandos disponíveis: window.aparenciaDebug.testar()');
    }
    
    // Exportar para uso global
    window.SistemaAparenciaCaracteristicas = {
        init: initAparencia
    };
})();

// ===========================================
// SISTEMA DE RIQUEZA - CARACTERÍSTICAS
// ===========================================

(function() {
    console.log('💰 Iniciando Sistema de Riqueza (Características)...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRiqueza);
    } else {
        setTimeout(initRiqueza, 500);
    }
    
    function initRiqueza() {
        // Dados dos níveis de riqueza
        const niveisRiqueza = {
            '-25': { nome: 'Falido', pontos: -25, multiplicador: 0.2 },
            '-15': { nome: 'Pobre', pontos: -15, multiplicador: 0.4 },
            '-10': { nome: 'Batalhador', pontos: -10, multiplicador: 0.6 },
            '0': { nome: 'Médio', pontos: 0, multiplicador: 1 },
            '10': { nome: 'Confortável', pontos: 10, multiplicador: 2 },
            '20': { nome: 'Rico', pontos: 20, multiplicador: 5 },
            '30': { nome: 'Muito Rico', pontos: 30, multiplicador: 10 },
            '50': { nome: 'Podre de Rico', pontos: 50, multiplicador: 20 }
        };
        
        // Elementos
        const selectRiqueza = document.getElementById('nivelRiqueza');
        const badgePontos = document.getElementById('pontosRiqueza');
        const displayInfo = document.getElementById('displayRiqueza');
        const rendaMensal = document.getElementById('rendaMensal');
        const resumoRiqueza = document.getElementById('resumoRiqueza');
        
        if (!selectRiqueza || !badgePontos || !displayInfo || !rendaMensal || !resumoRiqueza) {
            console.error('❌ Elementos da riqueza não encontrados!');
            return;
        }
        
        console.log('✅ Elementos da riqueza encontrados!');
        
        function atualizarRiqueza() {
            const valor = selectRiqueza.value;
            const dados = niveisRiqueza[valor];
            
            if (!dados) return;
            
            console.log('💰 Atualizando riqueza:', dados.nome, dados.pontos + 'pts');
            
            // 1. Badge
            atualizarBadge(dados.pontos);
            
            // 2. Display
            atualizarDisplay(dados);
            
            // 3. Renda mensal
            atualizarRenda(dados.multiplicador);
            
            // 4. Resumo
            atualizarResumo(dados.pontos);
            
            // 5. Evento
            dispararEvento(dados);
        }
        
        function atualizarBadge(pontos) {
            const texto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
            badgePontos.textContent = texto;
            
            if (pontos > 0) {
                badgePontos.style.background = 'linear-gradient(145deg, #2e5c3a, #27ae60)';
                badgePontos.style.color = 'white';
                badgePontos.style.border = '1px solid #27ae60';
            } else if (pontos < 0) {
                badgePontos.style.background = 'linear-gradient(145deg, #8b0000, #e74c3c)';
                badgePontos.style.color = 'white';
                badgePontos.style.border = '1px solid #e74c3c';
            } else {
                badgePontos.style.background = 'linear-gradient(145deg, #D4AF37, #FFD700)';
                badgePontos.style.color = '#1a1200';
                badgePontos.style.border = '1px solid #D4AF37';
            }
        }
        
        function atualizarDisplay(dados) {
            const descricoes = {
                'Falido': 'Vive de ajuda, sem recursos',
                'Pobre': 'Luta para sobreviver',
                'Batalhador': 'Ganha o suficiente',
                'Médio': 'Padrão de vida comum',
                'Confortável': 'Vida tranquila',
                'Rico': 'Muito bem de vida',
                'Muito Rico': 'Extremamente rico',
                'Podre de Rico': 'Fortuna colossal'
            };
            
            const descricao = descricoes[dados.nome] || '';
            
            displayInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="
                        background: ${dados.pontos > 0 ? '#27ae60' : dados.pontos < 0 ? '#e74c3c' : '#D4AF37'};
                        color: ${dados.pontos === 0 ? '#1a1200' : 'white'};
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 0.9rem;
                        flex-shrink: 0;
                    ">
                        ${dados.pontos >= 0 ? '+' : ''}${dados.pontos}
                    </div>
                    <div>
                        <strong style="
                            color: ${dados.pontos > 0 ? '#27ae60' : dados.pontos < 0 ? '#e74c3c' : '#D4AF37'};
                            font-size: 1.1rem;
                            display: block;
                            margin-bottom: 2px;
                        ">
                            ${dados.nome}
                        </strong>
                        <small style="color: white; opacity: 0.9; font-size: 0.9rem;">
                            Multiplicador: ${dados.multiplicador}x | ${descricao}
                        </small>
                    </div>
                </div>
            `;
        }
        
        function atualizarRenda(multiplicador) {
            const rendaBase = 1000;
            const renda = rendaBase * multiplicador;
            rendaMensal.textContent = `$${renda.toLocaleString()}`;
        }
        
        function atualizarResumo(pontos) {
            const texto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
            resumoRiqueza.textContent = texto;
            
            if (pontos > 0) {
                resumoRiqueza.style.color = '#27ae60';
                resumoRiqueza.style.fontWeight = 'bold';
            } else if (pontos < 0) {
                resumoRiqueza.style.color = '#e74c3c';
                resumoRiqueza.style.fontWeight = 'bold';
            } else {
                resumoRiqueza.style.color = '#D4AF37';
                resumoRiqueza.style.fontWeight = 'normal';
            }
        }
        
        function dispararEvento(dados) {
            const evento = new CustomEvent('caracteristicaRiquezaAtualizada', {
                detail: {
                    nome: dados.nome,
                    pontos: dados.pontos,
                    multiplicador: dados.multiplicador
                }
            });
            document.dispatchEvent(evento);
        }
        
        // Configurar eventos
        selectRiqueza.addEventListener('change', atualizarRiqueza);
        
        // Atualizar inicialmente
        setTimeout(() => {
            atualizarRiqueza();
        }, 100);
        
        window.riquezaDebug = {
            atualizar: atualizarRiqueza,
            testar: () => {
                console.log('🧪 Testando riqueza...');
                Object.keys(niveisRiqueza).forEach(valor => {
                    selectRiqueza.value = valor;
                    atualizarRiqueza();
                });
                selectRiqueza.value = '0';
                atualizarRiqueza();
            }
        };
        
        console.log('✅ Sistema de Riqueza configurado!');
    }
    
    window.SistemaRiquezaCaracteristicas = {
        init: initRiqueza
    };
})();

// ===========================================
// CALCULADOR DE TOTAL - CARACTERÍSTICAS
// ===========================================

(function() {
    console.log('🧮 Iniciando Calculador de Total...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCalculador);
    } else {
        setTimeout(initCalculador, 700);
    }
    
    function initCalculador() {
        const totalElement = document.getElementById('totalCaracteristicas');
        const resumoAparencia = document.getElementById('resumoAparencia');
        const resumoRiqueza = document.getElementById('resumoRiqueza');
        
        if (!totalElement) {
            console.error('❌ Elemento totalCaracteristicas não encontrado!');
            return;
        }
        
        function calcularTotal() {
            let total = 0;
            
            // Pontos da aparência
            if (resumoAparencia) {
                const texto = resumoAparencia.textContent;
                const match = texto.match(/[+-]?\d+/);
                if (match) {
                    total += parseInt(match[0]);
                }
            }
            
            // Pontos da riqueza
            if (resumoRiqueza) {
                const texto = resumoRiqueza.textContent;
                const match = texto.match(/[+-]?\d+/);
                if (match) {
                    total += parseInt(match[0]);
                }
            }
            
            // Atualizar display
            atualizarDisplayTotal(total);
            
            return total;
        }
        
        function atualizarDisplayTotal(total) {
            const texto = total >= 0 ? `+${total} pts` : `${total} pts`;
            totalElement.textContent = texto;
            
            if (total > 0) {
                totalElement.style.color = '#27ae60';
            } else if (total < 0) {
                totalElement.style.color = '#e74c3c';
            } else {
                totalElement.style.color = '#D4AF37';
            }
        }
        
        // Configurar eventos
        document.addEventListener('caracteristicaAparenciaAtualizada', calcularTotal);
        document.addEventListener('caracteristicaRiquezaAtualizada', calcularTotal);
        
        // Calcular inicialmente
        setTimeout(() => {
            calcularTotal();
        }, 300);
        
        console.log('✅ Calculador de Total configurado!');
    }
    
    window.CalculadorTotalCaracteristicas = {
        init: initCalculador
    };
})();

// ===========================================
// INICIALIZAÇÃO COMPLETA
// ===========================================

console.log('🎯 Sistema de Características pronto para iniciar!');
console.log('📝 Aguardando DOM...');