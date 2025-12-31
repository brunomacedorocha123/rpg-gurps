// sistema-escudo.js - SISTEMA DE ESCUDO INTEGRADO COM SISTEMA DE EQUIPAMENTOS

class SistemaEscudo {
    constructor() {
        this.escudoEquipado = null;
        this.BD = 0;            // Bônus de Defesa
        this.RD = 0;            // Resistência a Dano
        this.PVMaximo = 0;      // Pontos de Vida máximo
        this.PVAtual = 0;       // Pontos de Vida atual
        this.maosNecessarias = 0; // Mãos ocupadas pelo escudo
        this.ultimoIdUnico = null; // Para detectar mudanças
        
        console.log('🛡️ Sistema de escudo inicializando...');
        this.init();
    }

    init() {
        this.configurarBotoes();
        this.configurarObservadorEquipamentos();
        this.verificarEscudoImediato();
        
        // Monitora a aba de combate
        this.configurarObservadorAbaCombate();
        
        console.log('✅ Sistema de escudo inicializado');
    }

    configurarBotoes() {
        // Configura botões de dano/cura do escudo
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('dano-5') || 
                e.target.closest('.btn-escudo.dano-5')) {
                e.preventDefault();
                this.aplicarDano(5);
            }
            else if (e.target.classList.contains('dano-1') || 
                     e.target.closest('.btn-escudo.dano-1')) {
                e.preventDefault();
                this.aplicarDano(1);
            }
            else if (e.target.classList.contains('cura-1') || 
                     e.target.closest('.btn-escudo.cura-1')) {
                e.preventDefault();
                this.aplicarCura(1);
            }
            else if (e.target.classList.contains('cura-5') || 
                     e.target.closest('.btn-escudo.cura-5')) {
                e.preventDefault();
                this.aplicarCura(5);
            }
            else if (e.target.classList.contains('reset-escudo') || 
                     e.target.closest('.btn-escudo.reset')) {
                e.preventDefault();
                this.resetarEscudo();
            }
        });
    }

    configurarObservadorEquipamentos() {
        // Escuta eventos do sistema de equipamentos
        document.addEventListener('equipamentosAtualizados', () => {
            setTimeout(() => {
                this.verificarEscudo();
            }, 200);
        });

        // Observa mudanças diretas no sistema de equipamentos
        if (window.sistemaEquipamentos) {
            const methodsToWatch = ['equiparItem', 'desequiparItem', 'colocarNoCorpo', 'removerDoCorpo', 'moverParaDeposito'];
            
            methodsToWatch.forEach(method => {
                const originalMethod = window.sistemaEquipamentos[method];
                if (originalMethod) {
                    window.sistemaEquipamentos[method] = function(...args) {
                        const result = originalMethod.apply(this, args);
                        
                        // Aguarda a atualização do sistema
                        setTimeout(() => {
                            if (window.sistemaEscudo) {
                                window.sistemaEscudo.verificarEscudo();
                            }
                        }, 150);
                        
                        return result;
                    };
                }
            });
        }

        // Verifica periodicamente (fallback)
        setInterval(() => {
            this.verificarEscudo();
        }, 3000);
    }

    configurarObservadorAbaCombate() {
        // Monitora quando a aba de combate é ativada
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' && 
                    mutation.target.id === 'combate') {
                    
                    if (mutation.target.classList.contains('active')) {
                        setTimeout(() => {
                            this.verificarEscudoImediato();
                        }, 300);
                    }
                }
            });
        });

        const abaCombate = document.getElementById('combate');
        if (abaCombate) {
            observer.observe(abaCombate, { attributes: true });
        }
    }

    verificarEscudoImediato() {
        console.log('🔍 Verificação imediata de escudo...');
        this.verificarEscudo();
        
        // Tenta novamente após 1s (para garantir que o sistema de equipamentos carregou)
        setTimeout(() => this.verificarEscudo(), 1000);
    }

    verificarEscudo() {
        if (!window.sistemaEquipamentos) {
            console.warn('⚠️ Sistema de equipamentos não disponível');
            return;
        }

        try {
            // Procura por escudos equipados ou no corpo
            const escudosEncontrados = [];
            
            // 1. Escudos equipados (status: 'equipado')
            const escudosEquipados = window.sistemaEquipamentos.equipamentosEquipados?.escudos || [];
            if (escudosEquipados.length > 0) {
                escudosEncontrados.push(...escudosEquipados);
            }
            
            // 2. Escudos no corpo (status: 'no-corpo')
            const escudosNoCorpo = window.sistemaEquipamentos.equipamentosAdquiridos?.filter(item => 
                (item.tipo === 'escudo' || item.bd !== undefined) && 
                item.status === 'no-corpo'
            ) || [];
            
            escudosEncontrados.push(...escudosNoCorpo);
            
            // 3. Escudos na mão (status: 'equipado' em maos)
            const escudosNaMao = window.sistemaEquipamentos.equipamentosEquipados?.maos?.filter(item => 
                item.tipo === 'escudo' || item.bd !== undefined
            ) || [];
            
            escudosEncontrados.push(...escudosNaMao);
            
            // Remove duplicados baseado em idUnico
            const escudosUnicos = Array.from(new Map(
                escudosEncontrados.map(item => [item.idUnico, item])
            ).values());
            
            console.log(`🛡️ ${escudosUnicos.length} escudo(s) encontrado(s)`);
            
            if (escudosUnicos.length > 0) {
                const escudoAtual = escudosUnicos[0]; // Pega o primeiro escudo
                
                if (!this.escudoEquipado || 
                    this.escudoEquipado.idUnico !== escudoAtual.idUnico ||
                    this.ultimoIdUnico !== escudoAtual.idUnico) {
                    
                    console.log(`🔄 Novo escudo detectado: ${escudoAtual.nome}`);
                    this.escudoEquipado = escudoAtual;
                    this.ultimoIdUnico = escudoAtual.idUnico;
                    this.carregarDadosEscudo(escudoAtual);
                    this.atualizarCard();
                } else {
                    // Atualiza dados caso tenham mudado (ex: escudo foi vendido)
                    this.atualizarCard();
                }
            } else {
                if (this.escudoEquipado) {
                    console.log('❌ Escudo removido');
                    this.escudoEquipado = null;
                    this.ultimoIdUnico = null;
                    this.atualizarCardVazio();
                }
            }
        } catch (error) {
            console.error('❌ Erro ao verificar escudo:', error);
        }
    }

    carregarDadosEscudo(escudo) {
        console.log(`📊 Carregando dados do escudo: ${escudo.nome}`);
        
        // Extrai BD (Bônus de Defesa)
        this.BD = 0;
        if (escudo.bd) {
            const bdMatch = escudo.bd.toString().match(/\+?(\d+)/);
            if (bdMatch) {
                this.BD = parseInt(bdMatch[1]);
            }
        }
        
        // Extrai RD/PV
        this.RD = 0;
        this.PVMaximo = 0;
        
        if (escudo.rdpv) {
            const rdpvStr = escudo.rdpv.toString();
            
            // Padrões comuns: "5/20", "RD 5", "PV 40", "7/40"
            if (rdpvStr.includes('/')) {
                const partes = rdpvStr.split('/');
                this.RD = parseInt(partes[0].replace(/\D/g, '')) || 0;
                this.PVMaximo = parseInt(partes[1].replace(/\D/g, '')) || 0;
            } else if (rdpvStr.toLowerCase().includes('rd')) {
                this.RD = parseInt(rdpvStr.replace(/\D/g, '')) || 0;
                this.PVMaximo = 0;
            } else if (rdpvStr.toLowerCase().includes('pv')) {
                this.RD = 0;
                this.PVMaximo = parseInt(rdpvStr.replace(/\D/g, '')) || 0;
            } else {
                // Tenta extrair qualquer número
                const numero = parseInt(rdpvStr.replace(/\D/g, '')) || 0;
                this.RD = numero;
                this.PVMaximo = 0;
            }
        }
        
        // Mãos necessárias
        this.maosNecessarias = escudo.maos || 1;
        
        // Carrega PV atual salvo
        const chave = `escudo_${escudo.idUnico}`;
        const salvo = localStorage.getItem(chave);
        this.PVAtual = salvo ? parseInt(salvo) : this.PVMaximo;
        
        console.log(`✅ Dados carregados: BD=${this.BD}, RD=${this.RD}, PV=${this.PVAtual}/${this.PVMaximo}, Mãos=${this.maosNecessarias}`);
    }

    aplicarDano(dano) {
        if (!this.escudoEquipado) {
            this.mostrarFeedback('Nenhum escudo equipado!', 'erro');
            return;
        }
        
        if (this.PVMaximo > 0 && this.PVAtual <= 0) {
            this.mostrarFeedback('Escudo já está quebrado!', 'aviso');
            return;
        }
        
        let danoEfetivo = dano;
        
        // Se o escudo tem RD, aplica a redução
        if (this.RD > 0) {
            danoEfetivo = Math.max(0, dano - this.RD);
            console.log(`🎯 Dano ${dano} - RD ${this.RD} = ${danoEfetivo} de dano efetivo`);
        }
        
        if (this.PVMaximo > 0) {
            this.PVAtual = Math.max(0, this.PVAtual - danoEfetivo);
            
            // Se quebrou, notifica
            if (this.PVAtual === 0) {
                this.mostrarFeedback('Escudo quebrado!', 'erro');
            } else {
                this.mostrarFeedback(`Escudo sofreu ${danoEfetivo} de dano (${this.PVAtual}/${this.PVMaximo})`, 'info');
            }
        } else {
            // Escudo sem PV (apenas RD)
            this.mostrarFeedback(`Escudo absorveu ${dano} de dano (RD ${this.RD})`, 'info');
        }
        
        this.salvarPVAtual();
        this.atualizarCard();
    }

    aplicarCura(cura) {
        if (!this.escudoEquipado) {
            this.mostrarFeedback('Nenhum escudo equipado!', 'erro');
            return;
        }
        
        if (this.PVMaximo === 0) {
            this.mostrarFeedback('Este escudo não tem pontos de vida para curar', 'aviso');
            return;
        }
        
        if (this.PVAtual >= this.PVMaximo) {
            this.mostrarFeedback('Escudo já está com PV máximo!', 'aviso');
            return;
        }
        
        const curaEfetiva = Math.min(cura, this.PVMaximo - this.PVAtual);
        this.PVAtual += curaEfetiva;
        
        this.mostrarFeedback(`Escudo reparado +${curaEfetiva} PV (${this.PVAtual}/${this.PVMaximo})`, 'sucesso');
        
        this.salvarPVAtual();
        this.atualizarCard();
    }

    resetarEscudo() {
        if (!this.escudoEquipado) {
            this.mostrarFeedback('Nenhum escudo equipado!', 'erro');
            return;
        }
        
        if (this.PVMaximo === 0) {
            this.mostrarFeedback('Este escudo não tem pontos de vida', 'aviso');
            return;
        }
        
        if (confirm('Restaurar escudo para PV máximo?')) {
            this.PVAtual = this.PVMaximo;
            this.salvarPVAtual();
            this.atualizarCard();
            this.mostrarFeedback('Escudo restaurado para PV máximo', 'sucesso');
        }
    }

    salvarPVAtual() {
        if (this.escudoEquipado && this.escudoEquipado.idUnico && this.PVMaximo > 0) {
            localStorage.setItem(`escudo_${this.escudoEquipado.idUnico}`, this.PVAtual.toString());
        }
    }

    atualizarCard() {
        const nomeElement = document.getElementById('escudoNome');
        const drElement = document.getElementById('escudoDR');
        const statusElement = document.getElementById('escudoStatus');
        const pvTextoElement = document.getElementById('escudoPVTexto');
        const pvFillElement = document.getElementById('escudoPVFill');
        const bdElement = document.getElementById('escudoBD');

        if (!nomeElement || !drElement || !statusElement || !pvTextoElement || !pvFillElement) {
            console.warn('⚠️ Elementos do card de escudo não encontrados');
            return;
        }

        if (!this.escudoEquipado) {
            this.atualizarCardVazio();
            return;
        }

        // Nome do escudo
        nomeElement.textContent = this.escudoEquipado.nome;
        nomeElement.title = `Equipado em ${this.maosNecessarias} mão(s)`;

        // DR/RD (mostra o maior valor entre BD e RD)
        const valorDR = Math.max(this.BD, this.RD);
        drElement.textContent = valorDR;
        drElement.title = `Bônus de Defesa: +${this.BD} | Resistência: ${this.RD}`;

        // Status
        if (this.PVMaximo > 0) {
            if (this.PVAtual > 0) {
                const porcentagem = (this.PVAtual / this.PVMaximo) * 100;
                if (porcentagem >= 75) {
                    statusElement.textContent = 'Excelente';
                    statusElement.className = 'status-badge excelente';
                } else if (porcentagem >= 50) {
                    statusElement.textContent = 'Bom';
                    statusElement.className = 'status-badge bom';
                } else if (porcentagem >= 25) {
                    statusElement.textContent = 'Danificado';
                    statusElement.className = 'status-badge danificado';
                } else if (porcentagem > 0) {
                    statusElement.textContent = 'Crítico';
                    statusElement.className = 'status-badge critico';
                } else {
                    statusElement.textContent = 'Quebrado';
                    statusElement.className = 'status-badge quebrado';
                }
            } else {
                statusElement.textContent = 'Quebrado';
                statusElement.className = 'status-badge quebrado';
            }
        } else {
            statusElement.textContent = 'Ativo';
            statusElement.className = 'status-badge ativo';
        }

        // Barra de PV
        if (this.PVMaximo > 0) {
            const porcentagem = (this.PVAtual / this.PVMaximo) * 100;
            pvTextoElement.textContent = `${this.PVAtual}/${this.PVMaximo}`;
            pvFillElement.style.width = `${porcentagem}%`;
            
            // Cor baseada na porcentagem
            if (porcentagem > 60) {
                pvFillElement.style.background = '#2ecc71'; // Verde
            } else if (porcentagem > 30) {
                pvFillElement.style.background = '#f39c12'; // Amarelo/laranja
            } else if (porcentagem > 0) {
                pvFillElement.style.background = '#e74c3c'; // Vermelho
            } else {
                pvFillElement.style.background = '#7f8c8d'; // Cinza (quebrado)
            }
        } else {
            // Escudo sem PV (mostra RD)
            pvTextoElement.textContent = `RD ${this.RD}`;
            pvFillElement.style.width = '100%';
            pvFillElement.style.background = '#3498db'; // Azul
        }
    }

    atualizarCardVazio() {
        const nomeElement = document.getElementById('escudoNome');
        const drElement = document.getElementById('escudoDR');
        const statusElement = document.getElementById('escudoStatus');
        const pvTextoElement = document.getElementById('escudoPVTexto');
        const pvFillElement = document.getElementById('escudoPVFill');

        if (nomeElement) {
            nomeElement.textContent = 'Nenhum escudo equipado';
            nomeElement.title = 'Equipe um escudo no sistema de equipamentos';
        }
        if (drElement) {
            drElement.textContent = '0';
            drElement.title = 'Bônus de Defesa';
        }
        if (statusElement) {
            statusElement.textContent = 'Inativo';
            statusElement.className = 'status-badge inativo';
        }
        if (pvTextoElement) {
            pvTextoElement.textContent = '0/0';
        }
        if (pvFillElement) {
            pvFillElement.style.width = '0%';
            pvFillElement.style.background = '#95a5a6';
        }
    }

    mostrarFeedback(mensagem, tipo = 'info') {
        const feedback = document.createElement('div');
        feedback.className = `feedback-escudo feedback-${tipo}`;
        feedback.innerHTML = `<i class="fas fa-${tipo === 'sucesso' ? 'check-circle' : tipo === 'erro' ? 'times-circle' : tipo === 'aviso' ? 'exclamation-triangle' : 'info-circle'}"></i> ${mensagem}`;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'sucesso' ? '#27ae60' : tipo === 'erro' ? '#e74c3c' : tipo === 'aviso' ? '#f39c12' : '#3498db'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 9999;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 3000);
    }

    // Métodos públicos para chamada externa
    recalcular() {
        this.verificarEscudo();
    }

    obterDadosEscudo() {
        return {
            equipado: this.escudoEquipado !== null,
            nome: this.escudoEquipado?.nome || 'Nenhum',
            bd: this.BD,
            rd: this.RD,
            pvAtual: this.PVAtual,
            pvMaximo: this.PVMaximo,
            maos: this.maosNecessarias
        };
    }
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    if (window.sistemaEscudo) {
        console.log('⚠️ Sistema de escudo já inicializado');
        return;
    }

    const inicializarQuandoNecessario = () => {
        const abaCombate = document.getElementById('combate');
        const cardEscudo = document.querySelector('.escudo-section, .card-escudo');
        
        if ((abaCombate || cardEscudo) && !window.sistemaEscudo) {
            console.log('🛡️ Inicializando sistema de escudo...');
            window.sistemaEscudo = new SistemaEscudo();
            
            // Tenta verificar escudo imediatamente
            setTimeout(() => {
                window.sistemaEscudo.verificarEscudoImediato();
            }, 500);
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
        setTimeout(inicializarQuandoNecessario, 300);
    }
});

// ========== FUNÇÕES GLOBAIS (para chamada via onclick) ==========
window.danoEscudo = function(dano) {
    if (window.sistemaEscudo && window.sistemaEscudo.aplicarDano) {
        window.sistemaEscudo.aplicarDano(dano);
    }
};

window.curaEscudo = function(cura) {
    if (window.sistemaEscudo && window.sistemaEscudo.aplicarCura) {
        window.sistemaEscudo.aplicarCura(cura);
    }
};

window.resetEscudo = function() {
    if (window.sistemaEscudo && window.sistemaEscudo.resetarEscudo) {
        window.sistemaEscudo.resetarEscudo();
    }
};

window.recalcularEscudo = function() {
    if (window.sistemaEscudo && window.sistemaEscudo.recalcular) {
        window.sistemaEscudo.recalcular();
    }
};

window.obterDadosEscudo = function() {
    if (window.sistemaEscudo && window.sistemaEscudo.obterDadosEscudo) {
        return window.sistemaEscudo.obterDadosEscudo();
    }
    return null;
};

console.log('✅ sistema-escudo.js carregado');