// sistema-escudo.js - SISTEMA COMPLETO DE ESCUDO

class SistemaEscudo {
    constructor() {
        this.escudoEquipado = null;
        this.BD = 0;
        this.RD = 0;
        this.PVMaximo = 0;
        this.PVAtual = 0;
        
        console.log('🛡️ Sistema de escudo iniciado');
        this.inicializar();
    }

    inicializar() {
        // Configura os botões
        this.configurarBotoes();
        
        // Inicia a verificação
        this.verificarEscudo();
        
        // Verifica a cada 2 segundos
        setInterval(() => this.verificarEscudo(), 2000);
        
        // Escuta eventos de equipamentos
        document.addEventListener('equipamentosAtualizados', () => {
            setTimeout(() => this.verificarEscudo(), 300);
        });
    }

    configurarBotoes() {
        // Remove eventos antigos
        const botoes = document.querySelectorAll('.btn-escudo');
        botoes.forEach(botao => {
            botao.replaceWith(botao.cloneNode(true));
        });
        
        // Adiciona novos eventos
        document.addEventListener('click', (e) => {
            const botao = e.target.closest('.btn-escudo');
            if (!botao) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            if (botao.classList.contains('dano-5')) {
                this.aplicarDano(5);
            } else if (botao.classList.contains('dano-1')) {
                this.aplicarDano(1);
            } else if (botao.classList.contains('cura-1')) {
                this.aplicarCura(1);
            } else if (botao.classList.contains('cura-5')) {
                this.aplicarCura(5);
            } else if (botao.classList.contains('reset')) {
                this.resetarEscudo();
            }
        });
    }

    verificarEscudo() {
        if (!window.sistemaEquipamentos) return;
        
        try {
            // Busca escudos equipados
            let escudoEncontrado = null;
            
            // 1. Escudos na lista de escudos
            if (window.sistemaEquipamentos.equipamentosEquipados?.escudos?.length > 0) {
                escudoEncontrado = window.sistemaEquipamentos.equipamentosEquipados.escudos[0];
            }
            
            // 2. Escudos nas mãos
            if (!escudoEncontrado && window.sistemaEquipamentos.equipamentosEquipados?.maos) {
                for (let item of window.sistemaEquipamentos.equipamentosEquipados.maos) {
                    if (item.bd !== undefined || item.rdpv !== undefined) {
                        escudoEncontrado = item;
                        break;
                    }
                }
            }
            
            // 3. Escudos no corpo
            if (!escudoEncontrado && window.sistemaEquipamentos.equipamentosEquipados?.corpo) {
                for (let item of window.sistemaEquipamentos.equipamentosEquipados.corpo) {
                    if (item.bd !== undefined || item.rdpv !== undefined) {
                        escudoEncontrado = item;
                        break;
                    }
                }
            }
            
            // 4. Procura em todos os equipamentos adquiridos (fallback)
            if (!escudoEncontrado && window.sistemaEquipamentos.equipamentosAdquiridos) {
                for (let item of window.sistemaEquipamentos.equipamentosAdquiridos) {
                    if (item.equipado && (item.bd !== undefined || item.rdpv !== undefined)) {
                        escudoEncontrado = item;
                        break;
                    }
                }
            }
            
            // Processa o escudo encontrado
            if (escudoEncontrado) {
                if (!this.escudoEquipado || this.escudoEquipado.idUnico !== escudoEncontrado.idUnico) {
                    console.log(`✅ Escudo equipado: ${escudoEncontrado.nome}`);
                    this.escudoEquipado = escudoEncontrado;
                    this.carregarDadosEscudo(escudoEncontrado);
                    this.atualizarInterface();
                }
            } else {
                if (this.escudoEquipado) {
                    console.log('❌ Escudo removido');
                    this.escudoEquipado = null;
                    this.atualizarInterfaceVazia();
                }
            }
            
        } catch (error) {
            console.error('Erro ao verificar escudo:', error);
        }
    }

    carregarDadosEscudo(escudo) {
        // Extrai BD
        this.BD = 0;
        if (escudo.bd) {
            const match = escudo.bd.toString().match(/\d+/);
            this.BD = match ? parseInt(match[0]) : 0;
        }
        
        // Extrai RD e PV
        this.RD = 0;
        this.PVMaximo = 0;
        
        if (escudo.rdpv) {
            const str = escudo.rdpv.toString();
            
            // Formato "5/20" ou "7/40"
            if (str.includes('/')) {
                const partes = str.split('/');
                this.RD = parseInt(partes[0]) || 0;
                this.PVMaximo = parseInt(partes[1]) || 0;
            }
            // Formato "RD 5" ou "RD5"
            else if (str.toLowerCase().includes('rd')) {
                this.RD = parseInt(str.replace(/\D/g, '')) || 0;
            }
            // Formato "PV 50" ou "PV50"
            else if (str.toLowerCase().includes('pv')) {
                this.PVMaximo = parseInt(str.replace(/\D/g, '')) || 0;
            }
        }
        
        // Carrega PV salvo
        if (escudo.idUnico) {
            const chave = `escudo_${escudo.idUnico}_pv`;
            const salvo = localStorage.getItem(chave);
            this.PVAtual = salvo ? parseInt(salvo) : this.PVMaximo;
        } else {
            this.PVAtual = this.PVMaximo;
        }
        
        console.log(`📊 Dados escudo: BD=${this.BD}, RD=${this.RD}, PV=${this.PVAtual}/${this.PVMaximo}`);
    }

    aplicarDano(dano) {
        console.log(`⚔️ Aplicando ${dano} de dano no escudo`);
        
        if (!this.escudoEquipado) {
            console.log('⚠️ Nenhum escudo equipado');
            return;
        }
        
        let danoFinal = dano;
        
        // Aplica redução por RD
        if (this.RD > 0) {
            danoFinal = Math.max(0, dano - this.RD);
            console.log(`🛡️ RD ${this.RD} reduz dano para ${danoFinal}`);
        }
        
        // Aplica dano nos PV
        if (this.PVMaximo > 0) {
            const pvAntes = this.PVAtual;
            this.PVAtual = Math.max(0, this.PVAtual - danoFinal);
            
            console.log(`💔 PV: ${pvAntes} → ${this.PVAtual} (dano: ${danoFinal})`);
            
            // Salva no localStorage
            this.salvarPV();
            
            // Mostra feedback visual
            this.mostrarFeedback(`${danoFinal} de dano no escudo`);
            
            // Se quebrou
            if (this.PVAtual === 0) {
                console.log('🛡️ Escudo quebrado!');
            }
        } else {
            console.log(`🛡️ Escudo sem PV, apenas RD ${this.RD}`);
            this.mostrarFeedback(`Escudo absorveu ${dano} de dano`);
        }
        
        this.atualizarInterface();
    }

    aplicarCura(cura) {
        console.log(`❤️ Aplicando ${cura} de cura no escudo`);
        
        if (!this.escudoEquipado) {
            console.log('⚠️ Nenhum escudo equipado');
            return;
        }
        
        if (this.PVMaximo === 0) {
            console.log('⚠️ Escudo não tem pontos de vida');
            this.mostrarFeedback('Este escudo não tem PV para curar');
            return;
        }
        
        if (this.PVAtual >= this.PVMaximo) {
            console.log('⚠️ Escudo já está com PV máximo');
            this.mostrarFeedback('Escudo já está com PV máximo');
            return;
        }
        
        const pvAntes = this.PVAtual;
        this.PVAtual = Math.min(this.PVMaximo, this.PVAtual + cura);
        const curaEfetiva = this.PVAtual - pvAntes;
        
        console.log(`❤️ PV: ${pvAntes} → ${this.PVAtual} (cura: ${curaEfetiva})`);
        
        // Salva no localStorage
        this.salvarPV();
        
        // Feedback visual
        this.mostrarFeedback(`+${curaEfetiva} PV no escudo`);
        
        this.atualizarInterface();
    }

    resetarEscudo() {
        if (!this.escudoEquipado) {
            this.mostrarFeedback('Nenhum escudo equipado');
            return;
        }
        
        if (this.PVMaximo === 0) {
            this.mostrarFeedback('Este escudo não tem pontos de vida');
            return;
        }
        
        if (confirm('Restaurar escudo para PV máximo?')) {
            this.PVAtual = this.PVMaximo;
            this.salvarPV();
            this.atualizarInterface();
            this.mostrarFeedback('Escudo restaurado');
        }
    }

    salvarPV() {
        if (this.escudoEquipado && this.escudoEquipado.idUnico && this.PVMaximo > 0) {
            localStorage.setItem(`escudo_${this.escudoEquipado.idUnico}_pv`, this.PVAtual.toString());
        }
    }

    atualizarInterface() {
        // Nome do escudo
        const nomeElement = document.getElementById('escudoNome');
        if (nomeElement) {
            nomeElement.textContent = this.escudoEquipado ? this.escudoEquipado.nome : 'Nenhum escudo equipado';
        }
        
        // DR (BD ou RD, o que for maior)
        const drElement = document.getElementById('escudoDR');
        if (drElement) {
            const drValor = Math.max(this.BD, this.RD);
            drElement.textContent = drValor;
        }
        
        // Status
        const statusElement = document.getElementById('escudoStatus');
        if (statusElement) {
            if (!this.escudoEquipado) {
                statusElement.textContent = 'Inativo';
                statusElement.className = 'status-badge inativo';
            } else if (this.PVMaximo > 0) {
                if (this.PVAtual > 0) {
                    statusElement.textContent = 'Ativo';
                    statusElement.className = 'status-badge ativo';
                } else {
                    statusElement.textContent = 'Quebrado';
                    statusElement.className = 'status-badge quebrado';
                }
            } else {
                statusElement.textContent = 'Ativo';
                statusElement.className = 'status-badge ativo';
            }
        }
        
        // Barra de PV
        const pvTextoElement = document.getElementById('escudoPVTexto');
        const pvFillElement = document.getElementById('escudoPVFill');
        
        if (pvTextoElement && pvFillElement) {
            if (this.escudoEquipado) {
                if (this.PVMaximo > 0) {
                    // Escudo com PV
                    const porcentagem = (this.PVAtual / this.PVMaximo) * 100;
                    pvTextoElement.textContent = `${this.PVAtual}/${this.PVMaximo}`;
                    pvFillElement.style.width = `${porcentagem}%`;
                    
                    // Cor da barra
                    if (porcentagem > 50) {
                        pvFillElement.style.background = '#27ae60'; // Verde
                    } else if (porcentagem > 25) {
                        pvFillElement.style.background = '#f39c12'; // Amarelo
                    } else if (porcentagem > 0) {
                        pvFillElement.style.background = '#e74c3c'; // Vermelho
                    } else {
                        pvFillElement.style.background = '#7f8c8d'; // Cinza (quebrado)
                    }
                } else {
                    // Escudo sem PV (apenas RD)
                    pvTextoElement.textContent = `RD ${this.RD}`;
                    pvFillElement.style.width = '100%';
                    pvFillElement.style.background = '#3498db'; // Azul
                }
            } else {
                // Sem escudo
                pvTextoElement.textContent = '0/0';
                pvFillElement.style.width = '0%';
                pvFillElement.style.background = '#95a5a6';
            }
        }
    }

    atualizarInterfaceVazia() {
        const nomeElement = document.getElementById('escudoNome');
        const drElement = document.getElementById('escudoDR');
        const statusElement = document.getElementById('escudoStatus');
        const pvTextoElement = document.getElementById('escudoPVTexto');
        const pvFillElement = document.getElementById('escudoPVFill');

        if (nomeElement) nomeElement.textContent = 'Nenhum escudo equipado';
        if (drElement) drElement.textContent = '0';
        if (statusElement) {
            statusElement.textContent = 'Inativo';
            statusElement.className = 'status-badge inativo';
        }
        if (pvTextoElement) pvTextoElement.textContent = '0/0';
        if (pvFillElement) {
            pvFillElement.style.width = '0%';
            pvFillElement.style.background = '#95a5a6';
        }
    }

    mostrarFeedback(mensagem) {
        // Cria feedback simples
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2c3e50;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        `;
        
        feedback.textContent = `🛡️ ${mensagem}`;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 3000);
    }
}

// Inicialização global
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se a aba de combate existe
    const verificarSistema = () => {
        const cardEscudo = document.querySelector('.escudo-section');
        if (cardEscudo && !window.sistemaEscudo) {
            console.log('🛡️ Inicializando sistema de escudo...');
            window.sistemaEscudo = new SistemaEscudo();
            
            // Força primeira verificação
            setTimeout(() => {
                if (window.sistemaEscudo) {
                    window.sistemaEscudo.verificarEscudo();
                    window.sistemaEscudo.configurarBotoes();
                }
            }, 500);
        }
    };
    
    // Verifica imediatamente
    verificarSistema();
    
    // Verifica quando a aba de combate é ativada
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'combate' && tab.classList.contains('active')) {
                    setTimeout(verificarSistema, 100);
                }
            }
        });
    });
    
    const abaCombate = document.getElementById('combate');
    if (abaCombate) {
        observer.observe(abaCombate, { attributes: true });
    }
    
    // Se já está ativa
    const abaAtiva = document.querySelector('#combate.active');
    if (abaAtiva) {
        setTimeout(verificarSistema, 300);
    }
});

// Funções globais para os botões HTML
window.danoEscudo = function(dano) {
    if (window.sistemaEscudo && window.sistemaEscudo.aplicarDano) {
        window.sistemaEscudo.aplicarDano(dano);
    } else {
        console.error('Sistema de escudo não está disponível');
    }
};

window.curaEscudo = function(cura) {
    if (window.sistemaEscudo && window.sistemaEscudo.aplicarCura) {
        window.sistemaEscudo.aplicarCura(cura);
    } else {
        console.error('Sistema de escudo não está disponível');
    }
};

window.resetEscudo = function() {
    if (window.sistemaEscudo && window.sistemaEscudo.resetarEscudo) {
        window.sistemaEscudo.resetarEscudo();
    } else {
        console.error('Sistema de escudo não está disponível');
    }
};

// Forçar recálculo manual
window.recarregarEscudo = function() {
    if (window.sistemaEscudo && window.sistemaEscudo.verificarEscudo) {
        window.sistemaEscudo.verificarEscudo();
        window.sistemaEscudo.atualizarInterface();
    }
};

console.log('✅ sistema-escudo.js carregado');