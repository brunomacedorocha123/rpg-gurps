// ===========================================
// SISTEMA COMPLETO DE CARACTERÍSTICAS
// ===========================================

(function() {
    'use strict';
    
    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSistemaCaracteristicas);
    } else {
        setTimeout(initSistemaCaracteristicas, 100);
    }
    
    function initSistemaCaracteristicas() {
        console.log('⚡ Inicializando Sistema de Características');
        
        // Inicializar sistemas individuais
        initAparencia();
        initRiqueza();
        initCalculadorTotal();
    }
    
    // ===========================================
    // SISTEMA DE APARÊNCIA
    // ===========================================
    function initAparencia() {
        // Definir dados de aparência
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
        
        // Buscar elementos
        const selectAparencia = document.getElementById('nivelAparencia');
        const badgePontos = document.getElementById('pontosAparencia');
        const displayInfo = document.getElementById('displayAparencia');
        const resumoAparencia = document.getElementById('resumoAparencia');
        const totalSecao1 = document.getElementById('totalSecao1');
        
        // Verificar elementos
        if (!selectAparencia || !badgePontos || !displayInfo || !resumoAparencia || !totalSecao1) {
            console.warn('Elementos de aparência não encontrados, tentando novamente...');
            setTimeout(initAparencia, 300);
            return;
        }
        
        // Função para atualizar aparência
        function atualizarAparencia() {
            const valor = selectAparencia.value;
            const dados = niveisAparencia[valor] || niveisAparencia['0'];
            
            // Atualizar badge de pontos
            const textoPontos = dados.pontos >= 0 ? `+${dados.pontos} pts` : `${dados.pontos} pts`;
            badgePontos.textContent = textoPontos;
            
            // Estilizar badge
            if (dados.pontos > 0) {
                badgePontos.style.background = 'linear-gradient(145deg, #2e5c3a, #27ae60)';
                badgePontos.style.color = 'white';
                badgePontos.style.border = '1px solid #27ae60';
            } else if (dados.pontos < 0) {
                badgePontos.style.background = 'linear-gradient(145deg, #8b0000, #e74c3c)';
                badgePontos.style.color = 'white';
                badgePontos.style.border = '1px solid #e74c3c';
            } else {
                badgePontos.style.background = 'linear-gradient(145deg, #D4AF37, #FFD700)';
                badgePontos.style.color = '#1a1200';
                badgePontos.style.border = '1px solid #D4AF37';
            }
            
            // Atualizar display de informações
            let textoReacao = '';
            if (typeof dados.reacao === 'object') {
                textoReacao = `Reação: +${dados.reacao.mesmo} (mesmo sexo), +${dados.reacao.outro} (outro sexo)`;
            } else {
                const sinal = dados.reacao >= 0 ? '+' : '';
                textoReacao = `Reação: ${sinal}${dados.reacao}`;
            }
            
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
            
            // Atualizar resumo
            const textoResumo = dados.pontos >= 0 ? `+${dados.pontos} pts` : `${dados.pontos} pts`;
            resumoAparencia.textContent = textoResumo;
            
            if (dados.pontos > 0) {
                resumoAparencia.style.color = '#27ae60';
                resumoAparencia.style.fontWeight = 'bold';
            } else if (dados.pontos < 0) {
                resumoAparencia.style.color = '#e74c3c';
                resumoAparencia.style.fontWeight = 'bold';
            } else {
                resumoAparencia.style.color = '#D4AF37';
                resumoAparencia.style.fontWeight = 'normal';
            }
            
            // Atualizar total da seção
            totalSecao1.textContent = textoResumo;
            
            if (dados.pontos > 0) {
                totalSecao1.style.background = 'rgba(46, 92, 58, 0.8)';
                totalSecao1.style.color = 'white';
                totalSecao1.style.border = '1px solid #27ae60';
            } else if (dados.pontos < 0) {
                totalSecao1.style.background = 'rgba(139, 0, 0, 0.8)';
                totalSecao1.style.color = 'white';
                totalSecao1.style.border = '1px solid #e74c3c';
            } else {
                totalSecao1.style.background = 'rgba(212, 175, 55, 0.1)';
                totalSecao1.style.color = '#D4AF37';
                totalSecao1.style.border = '1px solid rgba(212, 175, 55, 0.3)';
            }
            
            // Disparar evento de atualização
            const evento = new CustomEvent('caracteristicaAparenciaAtualizada', {
                detail: {
                    nome: dados.nome,
                    pontos: dados.pontos,
                    reacao: dados.reacao
                }
            });
            document.dispatchEvent(evento);
        }
        
        // Configurar evento de mudança
        selectAparencia.addEventListener('change', atualizarAparencia);
        
        // Atualizar inicialmente
        setTimeout(() => {
            atualizarAparencia();
        }, 150);
    }
    
    // ===========================================
    // SISTEMA DE RIQUEZA
    // ===========================================
    function initRiqueza() {
        // Definir dados de riqueza
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
        
        // Buscar elementos
        const selectRiqueza = document.getElementById('nivelRiqueza');
        const badgePontos = document.getElementById('pontosRiqueza');
        const displayInfo = document.getElementById('displayRiqueza');
        const rendaMensal = document.getElementById('rendaMensal');
        const resumoRiqueza = document.getElementById('resumoRiqueza');
        
        // Verificar elementos
        if (!selectRiqueza || !badgePontos || !displayInfo || !rendaMensal || !resumoRiqueza) {
            console.warn('Elementos de riqueza não encontrados, tentando novamente...');
            setTimeout(initRiqueza, 300);
            return;
        }
        
        // Função para atualizar riqueza
        function atualizarRiqueza() {
            const valor = selectRiqueza.value;
            const dados = niveisRiqueza[valor] || niveisRiqueza['0'];
            
            // Atualizar badge de pontos
            const textoPontos = dados.pontos >= 0 ? `+${dados.pontos} pts` : `${dados.pontos} pts`;
            badgePontos.textContent = textoPontos;
            
            // Estilizar badge
            if (dados.pontos > 0) {
                badgePontos.style.background = 'linear-gradient(145deg, #2e5c3a, #27ae60)';
                badgePontos.style.color = 'white';
                badgePontos.style.border = '1px solid #27ae60';
            } else if (dados.pontos < 0) {
                badgePontos.style.background = 'linear-gradient(145deg, #8b0000, #e74c3c)';
                badgePontos.style.color = 'white';
                badgePontos.style.border = '1px solid #e74c3c';
            } else {
                badgePontos.style.background = 'linear-gradient(145deg, #D4AF37, #FFD700)';
                badgePontos.style.color = '#1a1200';
                badgePontos.style.border = '1px solid #D4AF37';
            }
            
            // Atualizar display de informações
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
            
            // Atualizar renda mensal
            const rendaBase = 1000;
            const renda = rendaBase * dados.multiplicador;
            rendaMensal.textContent = `$${renda.toLocaleString()}`;
            
            // Atualizar resumo
            resumoRiqueza.textContent = textoPontos;
            
            if (dados.pontos > 0) {
                resumoRiqueza.style.color = '#27ae60';
                resumoRiqueza.style.fontWeight = 'bold';
            } else if (dados.pontos < 0) {
                resumoRiqueza.style.color = '#e74c3c';
                resumoRiqueza.style.fontWeight = 'bold';
            } else {
                resumoRiqueza.style.color = '#D4AF37';
                resumoRiqueza.style.fontWeight = 'normal';
            }
            
            // Disparar evento de atualização
            const evento = new CustomEvent('caracteristicaRiquezaAtualizada', {
                detail: {
                    nome: dados.nome,
                    pontos: dados.pontos,
                    multiplicador: dados.multiplicador
                }
            });
            document.dispatchEvent(evento);
        }
        
        // Configurar evento de mudança
        selectRiqueza.addEventListener('change', atualizarRiqueza);
        
        // Atualizar inicialmente
        setTimeout(() => {
            atualizarRiqueza();
        }, 200);
    }
    
    // ===========================================
    // CALCULADOR DE TOTAL
    // ===========================================
    function initCalculadorTotal() {
        // Buscar elementos
        const totalElement = document.getElementById('totalCaracteristicas');
        
        if (!totalElement) {
            console.warn('Elemento totalCaracteristicas não encontrado, tentando novamente...');
            setTimeout(initCalculadorTotal, 300);
            return;
        }
        
        // Função para calcular total
        function calcularTotal() {
            let total = 0;
            
            // Pontos da aparência
            const resumoAparencia = document.getElementById('resumoAparencia');
            if (resumoAparencia && resumoAparencia.textContent) {
                const texto = resumoAparencia.textContent;
                const match = texto.match(/[+-]?\d+/);
                if (match) {
                    total += parseInt(match[0], 10);
                }
            }
            
            // Pontos da riqueza
            const resumoRiqueza = document.getElementById('resumoRiqueza');
            if (resumoRiqueza && resumoRiqueza.textContent) {
                const texto = resumoRiqueza.textContent;
                const match = texto.match(/[+-]?\d+/);
                if (match) {
                    total += parseInt(match[0], 10);
                }
            }
            
            // Atualizar display
            const textoTotal = total >= 0 ? `+${total} pts` : `${total} pts`;
            totalElement.textContent = textoTotal;
            
            if (total > 0) {
                totalElement.style.color = '#27ae60';
            } else if (total < 0) {
                totalElement.style.color = '#e74c3c';
            } else {
                totalElement.style.color = '#D4AF37';
            }
            
            return total;
        }
        
        // Configurar eventos de atualização
        document.addEventListener('caracteristicaAparenciaAtualizada', calcularTotal);
        document.addEventListener('caracteristicaRiquezaAtualizada', calcularTotal);
        
        // Calcular total inicial
        setTimeout(() => {
            calcularTotal();
        }, 300);
    }
})();

// ===========================================
// CÓDIGO PARA LIDAR COM O ERRO NO atributos.js
// ===========================================

// Adicionar esta função para corrigir o erro no atributos.js
(function() {
    'use strict';
    
    // Sobrescrever a função problemática ou adicionar proteção
    function protegerAtributosJs() {
        // Verificar se a função problemática existe
        if (typeof window.dispararEventoAlteracao === 'function') {
            // Salvar a função original
            const originalDispararEventoAlteracao = window.dispararEventoAlteracao;
            
            // Criar uma versão segura
            window.dispararEventoAlteracao = function() {
                try {
                    return originalDispararEventoAlteracao.apply(this, arguments);
                } catch (error) {
                    console.warn('Erro em dispararEventoAlteracao capturado:', error.message);
                    return null;
                }
            };
        }
        
        // Proteger outras funções problemáticas
        if (typeof window.calcularTudo === 'function') {
            const originalCalcularTudo = window.calcularTudo;
            
            window.calcularTudo = function() {
                try {
                    return originalCalcularTudo.apply(this, arguments);
                } catch (error) {
                    console.warn('Erro em calcularTudo capturado:', error.message);
                    return 0;
                }
            };
        }
    }
    
    // Executar após um pequeno delay
    setTimeout(protegerAtributosJs, 1000);
})();