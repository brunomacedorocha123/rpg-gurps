// ===========================================
// SISTEMA DE APARÊNCIA - CARACTERÍSTICAS
// ===========================================

(function() {
    function initAparencia() {
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
        
        const selectAparencia = document.getElementById('nivelAparencia');
        
        if (!selectAparencia) {
            setTimeout(initAparencia, 300);
            return;
        }
        
        const badgePontos = document.getElementById('pontosAparencia');
        const displayInfo = document.getElementById('displayAparencia');
        const resumoAparencia = document.getElementById('resumoAparencia');
        const totalSecao1 = document.getElementById('totalSecao1');
        
        if (!selectAparencia || !badgePontos || !displayInfo || !resumoAparencia || !totalSecao1) {
            setTimeout(initAparencia, 300);
            return;
        }
        
        function atualizarAparencia() {
            const valor = selectAparencia.value || '0';
            const dados = niveisAparencia[valor] || niveisAparencia['0'];
            
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
            }
            
            atualizarBadge(dados.pontos);
            atualizarDisplay(dados);
            atualizarResumo(dados.pontos);
            atualizarTotalSecao(dados.pontos);
            dispararEventoAtualizacao(dados);
        }
        
        selectAparencia.addEventListener('change', atualizarAparencia);
        
        setTimeout(() => {
            atualizarAparencia();
        }, 100);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAparencia);
    } else {
        setTimeout(initAparencia, 300);
    }
})();

// ===========================================
// SISTEMA DE RIQUEZA - CARACTERÍSTICAS
// ===========================================

(function() {
    function initRiqueza() {
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
        
        const selectRiqueza = document.getElementById('nivelRiqueza');
        
        if (!selectRiqueza) {
            setTimeout(initRiqueza, 300);
            return;
        }
        
        const badgePontos = document.getElementById('pontosRiqueza');
        const displayInfo = document.getElementById('displayRiqueza');
        const rendaMensal = document.getElementById('rendaMensal');
        const resumoRiqueza = document.getElementById('resumoRiqueza');
        
        if (!selectRiqueza || !badgePontos || !displayInfo || !rendaMensal || !resumoRiqueza) {
            setTimeout(initRiqueza, 300);
            return;
        }
        
        function atualizarRiqueza() {
            const valor = selectRiqueza.value || '0';
            const dados = niveisRiqueza[valor] || niveisRiqueza['0'];
            
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
            
            atualizarBadge(dados.pontos);
            atualizarDisplay(dados);
            atualizarRenda(dados.multiplicador);
            atualizarResumo(dados.pontos);
            dispararEvento(dados);
        }
        
        selectRiqueza.addEventListener('change', atualizarRiqueza);
        
        setTimeout(() => {
            atualizarRiqueza();
        }, 100);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRiqueza);
    } else {
        setTimeout(initRiqueza, 300);
    }
})();

// ===========================================
// CALCULADOR DE TOTAL - CARACTERÍSTICAS
// ===========================================

(function() {
    function initCalculador() {
        const totalElement = document.getElementById('totalCaracteristicas');
        
        if (!totalElement) {
            setTimeout(initCalculador, 300);
            return;
        }
        
        const resumoAparencia = document.getElementById('resumoAparencia');
        const resumoRiqueza = document.getElementById('resumoRiqueza');
        
        function calcularTotal() {
            let total = 0;
            
            if (resumoAparencia) {
                const texto = resumoAparencia.textContent;
                const match = texto.match(/[+-]?\d+/);
                if (match) {
                    total += parseInt(match[0]);
                }
            }
            
            if (resumoRiqueza) {
                const texto = resumoRiqueza.textContent;
                const match = texto.match(/[+-]?\d+/);
                if (match) {
                    total += parseInt(match[0]);
                }
            }
            
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
        
        document.addEventListener('caracteristicaAparenciaAtualizada', calcularTotal);
        document.addEventListener('caracteristicaRiquezaAtualizada', calcularTotal);
        
        setTimeout(() => {
            calcularTotal();
        }, 300);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCalculador);
    } else {
        setTimeout(initCalculador, 300);
    }
})();