// sistema-rd-novo.js - Sistema Automático de Resistência a Dano para novo projeto
// Integrado com sistemaEquipamentos do equipamentos.js

class SistemaRD {
    constructor() {
        this.partesCorpo = [
            'cabeca', 'tronco', 'rosto', 'crânio', 'pescoco',
            'virilha', 'bracos', 'pernas', 'maos', 'pes'
        ];
        
        // Mapeamento entre locais de armadura e partes do corpo
        this.mapeamentoArmaduras = {
            'Cabeça': ['cabeca', 'crânio', 'rosto'],
            'Tronco': ['tronco'],
            'Torso': ['tronco'],
            'Tronco/Virilha': ['tronco', 'virilha'],
            'Braços': ['bracos'],
            'Pernas': ['pernas'],
            'Mãos': ['maos'],
            'Pés': ['pes'],
            'Corpo Inteiro': ['tronco', 'virilha', 'bracos', 'pernas', 'cabeca', 'crânio', 'rosto', 'pescoco', 'maos', 'pes']
        };
        
        this.rdCalculado = {};
        this.partesCorpo.forEach(parte => {
            this.rdCalculado[parte] = 0;
        });
        
        this.inicializado = false;
        this.inicializarQuandoPronto();
    }
    
    async inicializarQuandoPronto() {
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
        
        await this.aguardarSistemaEquipamentos();
        this.inicializar();
    }
    
    aguardarSistemaEquipamentos() {
        return new Promise((resolve) => {
            let tentativas = 0;
            const verificar = () => {
                tentativas++;
                if (window.sistemaEquipamentos && 
                    window.sistemaEquipamentos.equipamentosAdquiridos !== undefined) {
                    console.log('✅ Sistema de equipamentos carregado para RD');
                    resolve();
                } else if (tentativas < 50) {
                    setTimeout(verificar, 100);
                } else {
                    console.warn('⚠️ Sistema de equipamentos não encontrado após 5s');
                    resolve();
                }
            };
            verificar();
        });
    }
    
    inicializar() {
        try {
            console.log('🛡️ Inicializando sistema automático de RD...');
            
            this.limparEventosConflitantes();
            this.configurarObservadorEquipamentos();
            this.configurarEventosCamposRD();
            
            setTimeout(() => {
                this.calcularRDAutomatico();
                this.atualizarInterfaceRD();
            }, 300);
            
            this.adicionarBotaoReset();
            
            this.inicializado = true;
            console.log('✅ Sistema de RD inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema RD:', error);
        }
    }
    
    limparEventosConflitantes() {
        // Remove eventos antigos dos campos RD para evitar conflitos
        document.querySelectorAll('.rd-input').forEach(input => {
            const originalOnChange = input.onchange;
            if (originalOnChange) {
                input.onchange = null;
            }
        });
        
        // Sobrescreve a função global se existir
        if (window.calcularRDTotal) {
            window.calcularRDTotal = () => {
                if (window.sistemaRD) {
                    return window.sistemaRD.atualizarTotalRD();
                }
                return 0;
            };
        }
    }
    
    configurarObservadorEquipamentos() {
        // Escuta eventos do sistema de equipamentos
        document.addEventListener('equipamentosAtualizados', () => {
            setTimeout(() => {
                this.calcularRDAutomatico();
                this.atualizarInterfaceRD();
            }, 100);
        });
        
        // Modifica o sistema de equipamentos para notificar mudanças
        if (window.sistemaEquipamentos) {
            const originalAtualizarInterface = window.sistemaEquipamentos.atualizarInterface;
            if (originalAtualizarInterface) {
                window.sistemaEquipamentos.atualizarInterface = function() {
                    const resultado = originalAtualizarInterface.apply(this, arguments);
                    
                    setTimeout(() => {
                        if (window.sistemaRD) {
                            window.sistemaRD.calcularRDAutomatico();
                            window.sistemaRD.atualizarInterfaceRD();
                        }
                    }, 150);
                    
                    return resultado;
                };
            }
            
            // Observa mudanças específicas no corpo
            const observerMethods = ['colocarNoCorpo', 'removerDoCorpo', 'equiparItem', 'desequiparItem'];
            observerMethods.forEach(method => {
                const originalMethod = window.sistemaEquipamentos[method];
                if (originalMethod) {
                    window.sistemaEquipamentos[method] = function(...args) {
                        const result = originalMethod.apply(this, args);
                        setTimeout(() => {
                            if (window.sistemaRD) {
                                window.sistemaRD.calcularRDAutomatico();
                                window.sistemaRD.atualizarInterfaceRD();
                            }
                        }, 100);
                        return result;
                    };
                }
            });
        }
    }
    
    configurarEventosCamposRD() {
        // Configura eventos para edição manual dos campos RD
        this.partesCorpo.forEach(parte => {
            const input = document.querySelector(`.rd-parte[data-parte="${parte}"] input`);
            if (input) {
                // Clona o input para limpar eventos antigos
                const novoInput = input.cloneNode(true);
                input.parentNode.replaceChild(novoInput, input);
                
                novoInput.addEventListener('change', (e) => {
                    const valor = parseInt(e.target.value) || 0;
                    this.rdCalculado[parte] = valor;
                    this.atualizarTotalRD();
                    e.target.classList.add('editado-manual');
                    e.target.title = 'Valor editado manualmente';
                });
                
                novoInput.addEventListener('input', (e) => {
                    e.target.style.backgroundColor = 'rgba(155, 89, 182, 0.2)';
                });
                
                novoInput.addEventListener('blur', (e) => {
                    setTimeout(() => {
                        e.target.style.backgroundColor = '';
                    }, 500);
                });
            }
        });
    }
    
    adicionarBotaoReset() {
        // Cria botão para recalcular RD automaticamente
        const botaoReset = document.createElement('button');
        botaoReset.className = 'btn-rd-reset';
        botaoReset.innerHTML = '<i class="fas fa-sync-alt"></i> Recalcular RD';
        botaoReset.title = 'Recalcular RD automaticamente com base nos equipamentos no corpo';
        
        botaoReset.addEventListener('click', () => {
            this.calcularRDAutomatico();
            this.atualizarInterfaceRD();
            this.mostrarFeedback('RD recalculado com base nos equipamentos!', 'info');
        });
        
        const cardHeader = document.querySelector('.card-rd .card-header');
        if (cardHeader) {
            if (!cardHeader.querySelector('.btn-rd-reset')) {
                cardHeader.appendChild(botaoReset);
            }
        }
    }
    
    calcularRDAutomatico() {
        console.log('🔄 Calculando RD automático...');
        
        // Reseta todos os valores
        this.partesCorpo.forEach(parte => {
            this.rdCalculado[parte] = 0;
        });
        
        if (!window.sistemaEquipamentos) {
            console.warn('⚠️ Sistema de equipamentos não disponível');
            return;
        }
        
        // Procura por armaduras no corpo
        const itensNoCorpo = window.sistemaEquipamentos.equipamentosAdquiridos.filter(item => 
            item.status === 'no-corpo' || item.status === 'equipado'
        );
        
        console.log(`🔍 ${itensNoCorpo.length} itens no corpo/equipados encontrados`);
        
        // Processa cada armadura
        itensNoCorpo.forEach(item => {
            this.processarArmadura(item);
        });
        
        // Também processa armaduras equipadas (status: 'equipado')
        const armadurasEquipadas = window.sistemaEquipamentos.equipamentosEquipados?.armaduras || [];
        armadurasEquipadas.forEach(item => {
            this.processarArmadura(item);
        });
    }
    
    processarArmadura(armadura) {
        if (!armadura) return;
        
        console.log(`🛡️ Processando armadura: ${armadura.nome}`);
        
        // Verifica se é uma armadura (tem RD ou local)
        const temRD = armadura.rd !== undefined && armadura.rd !== null && armadura.rd !== 0;
        const temLocal = armadura.local !== undefined;
        
        if (!temRD && !temLocal) {
            console.log(`❌ ${armadura.nome} não parece ser armadura (sem RD/local)`);
            return;
        }
        
        // Extrai valor do RD (pode ser número ou string como "4/2")
        let rdValor = 0;
        
        if (typeof armadura.rd === 'number') {
            rdValor = armadura.rd;
        } else if (typeof armadura.rd === 'string') {
            // Para valores como "4/2", pega o primeiro número
            const partes = armadura.rd.toString().split('/');
            rdValor = parseInt(partes[0]) || 0;
        }
        
        if (rdValor === 0) {
            console.log(`⚠️ ${armadura.nome} tem RD 0, ignorando`);
            return;
        }
        
        console.log(`✅ ${armadura.nome} - RD: ${rdValor}, Local: ${armadura.local}`);
        
        // Determina quais partes do corpo são protegidas
        const partesProtegidas = this.determinarPartesProtegidas(armadura);
        
        // Aplica o RD às partes
        partesProtegidas.forEach(parte => {
            if (this.rdCalculado[parte] !== undefined) {
                const rdAtual = this.rdCalculado[parte];
                this.rdCalculado[parte] += rdValor;
                console.log(`   → ${parte}: ${rdAtual} + ${rdValor} = ${this.rdCalculado[parte]}`);
            }
        });
    }
    
    determinarPartesProtegidas(armadura) {
        const partes = [];
        
        // Primeiro tenta pelo mapeamento direto
        if (armadura.local && this.mapeamentoArmaduras[armadura.local]) {
            return this.mapeamentoArmaduras[armadura.local];
        }
        
        // Fallback: análise do nome/local
        if (armadura.local) {
            const localLower = armadura.local.toLowerCase();
            
            if (localLower.includes('tronco') || localLower.includes('torso')) {
                partes.push('tronco');
                if (localLower.includes('virilha')) {
                    partes.push('virilha');
                }
            }
            else if (localLower.includes('cabeça') || localLower.includes('cabeca')) {
                partes.push('cabeca', 'crânio', 'rosto');
            }
            else if (localLower.includes('braço') || localLower.includes('braco')) {
                partes.push('bracos');
            }
            else if (localLower.includes('perna')) {
                partes.push('pernas');
            }
            else if (localLower.includes('mão') || localLower.includes('mao')) {
                partes.push('maos');
            }
            else if (localLower.includes('pé') || localLower.includes('pe')) {
                partes.push('pes');
            }
            else if (localLower.includes('pescoço') || localLower.includes('pescoco')) {
                partes.push('pescoco');
            }
        }
        
        // Se ainda não encontrou, tenta pelo nome
        if (partes.length === 0 && armadura.nome) {
            const nomeLower = armadura.nome.toLowerCase();
            
            if (nomeLower.includes('elmo') || nomeLower.includes('capacete') || nomeLower.includes('helm')) {
                partes.push('cabeca', 'crânio', 'rosto');
            }
            else if (nomeLower.includes('couro') || nomeLower.includes('cota') || nomeLower.includes('armadura')) {
                if (nomeLower.includes('virilha') || nomeLower.includes('completa')) {
                    partes.push('tronco', 'virilha');
                } else {
                    partes.push('tronco');
                }
            }
            else if (nomeLower.includes('braçadeira') || nomeLower.includes('brace')) {
                partes.push('bracos');
            }
            else if (nomeLower.includes('perneira') || nomeLower.includes('greva')) {
                partes.push('pernas');
            }
            else if (nomeLower.includes('manopla') || nomeLower.includes('luva')) {
                partes.push('maos');
            }
            else if (nomeLower.includes('bota') || nomeLower.includes('sapat')) {
                partes.push('pes');
            }
        }
        
        // Remove duplicados
        return [...new Set(partes)];
    }
    
    atualizarTotalRD() {
        let total = 0;
        
        this.partesCorpo.forEach(parte => {
            total += this.rdCalculado[parte] || 0;
        });
        
        const rdTotalElement = document.getElementById('rdTotal');
        if (rdTotalElement) {
            rdTotalElement.textContent = total;
            
            if (total > 0) {
                rdTotalElement.classList.add('com-protecao');
                rdTotalElement.title = `Resistência a Dano Total: ${total}`;
            } else {
                rdTotalElement.classList.remove('com-protecao');
                rdTotalElement.title = 'Sem proteção de armadura';
            }
        }
        
        return total;
    }
    
    atualizarInterfaceRD() {
        this.partesCorpo.forEach(parte => {
            const rdValor = this.rdCalculado[parte] || 0;
            
            const input = document.querySelector(`.rd-parte[data-parte="${parte}"] input`);
            const container = document.querySelector(`.rd-parte[data-parte="${parte}"]`);
            
            if (input && container) {
                input.value = rdValor;
                const editadoManual = input.classList.contains('editado-manual');
                
                // Remove classes antigas
                container.classList.remove('sem-rd', 'rd-baixo', 'rd-medio', 'rd-alto', 'editado-manualmente');
                
                // Aplica classes baseadas no valor
                if (editadoManual) {
                    container.classList.add('editado-manualmente');
                    container.title = 'Valor editado manualmente';
                } else if (rdValor === 0) {
                    container.classList.add('sem-rd');
                    container.title = 'Sem proteção';
                } else if (rdValor <= 2) {
                    container.classList.add('rd-baixo');
                    container.title = `Proteção leve: RD ${rdValor}`;
                } else if (rdValor <= 5) {
                    container.classList.add('rd-medio');
                    container.title = `Proteção média: RD ${rdValor}`;
                } else {
                    container.classList.add('rd-alto');
                    container.title = `Proteção pesada: RD ${rdValor}`;
                }
                
                // Atualiza badge visual
                let badge = container.querySelector('.rd-badge');
                if (!badge && rdValor > 0) {
                    badge = document.createElement('span');
                    badge.className = 'rd-badge';
                    container.appendChild(badge);
                }
                
                if (badge) {
                    if (rdValor > 0) {
                        badge.textContent = `RD ${rdValor}`;
                        badge.style.display = 'inline-block';
                    } else {
                        badge.style.display = 'none';
                    }
                }
            }
        });
        
        this.atualizarTotalRD();
        this.notificarMudancaRD();
    }
    
    notificarMudancaRD() {
        const event = new CustomEvent('rdAtualizado', {
            detail: {
                rdCalculado: this.rdCalculado,
                rdTotal: this.atualizarTotalRD(),
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);
    }
    
    mostrarFeedback(mensagem, tipo = 'info') {
        const feedback = document.createElement('div');
        feedback.className = `feedback-rd feedback-${tipo}`;
        feedback.innerHTML = `<i class="fas fa-info-circle"></i> ${mensagem}`;
        feedback.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${tipo === 'sucesso' ? '#27ae60' : tipo === 'erro' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 9999;
            font-weight: bold;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 3000);
    }
    
    // Método para forçar recálculo (pode ser chamado externamente)
    recalcular() {
        this.calcularRDAutomatico();
        this.atualizarInterfaceRD();
    }
}

// ========== INICIALIZAÇÃO GLOBAL ==========
document.addEventListener('DOMContentLoaded', function() {
    if (window.sistemaRD) {
        console.log('⚠️ Sistema RD já inicializado');
        return;
    }
    
    const inicializarQuandoNecessario = () => {
        const abaCombate = document.getElementById('combate');
        
        if (abaCombate && !window.sistemaRD) {
            console.log('⚔️ Aba de combate detectada, inicializando sistema RD...');
            window.sistemaRD = new SistemaRD();
        }
    };
    
    inicializarQuandoNecessario();
    
    // Observa quando a aba de combate é ativada
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'combate' && tab.classList.contains('active')) {
                    setTimeout(inicializarQuandoNecessario, 100);
                }
            }
        });
    });
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
    
    // Verifica se já está ativa
    const abaCombateAtiva = document.querySelector('#combate.active');
    if (abaCombateAtiva) {
        setTimeout(inicializarQuandoNecessario, 500);
    }
});

// ========== FUNÇÕES GLOBAIS ==========
window.calcularRDAutomatico = function() {
    if (window.sistemaRD && window.sistemaRD.calcularRDAutomatico) {
        window.sistemaRD.calcularRDAutomatico();
        window.sistemaRD.atualizarInterfaceRD();
        return true;
    }
    return false;
};

window.obterRDTotal = function() {
    if (window.sistemaRD && window.sistemaRD.atualizarTotalRD) {
        return window.sistemaRD.atualizarTotalRD();
    }
    return 0;
};

window.obterRDCalculado = function() {
    if (window.sistemaRD) {
        return window.sistemaRD.rdCalculado;
    }
    return {};
};

window.recalcularRD = function() {
    if (window.sistemaRD && window.sistemaRD.recalcular) {
        window.sistemaRD.recalcular();
        return true;
    }
    return false;
};

window.SistemaRD = SistemaRD;

console.log('✅ Sistema RD adaptado para novo projeto carregado!');