// sistema-escudo.js - SISTEMA FUNCIONAL DE ESCUDO

class SistemaEscudo {
    constructor() {
        this.escudoEquipado = null;
        this.BD = 0;
        this.RD = 0;
        this.PVMaximo = 0;
        this.PVAtual = 0;
        
        this.init();
    }

    init() {
        // Configura botões
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-escudo');
            if (!btn) return;
            
            if (btn.classList.contains('dano-5')) {
                this.aplicarDano(5);
            } else if (btn.classList.contains('dano-1')) {
                this.aplicarDano(1);
            } else if (btn.classList.contains('cura-1')) {
                this.aplicarCura(1);
            } else if (btn.classList.contains('cura-5')) {
                this.aplicarCura(5);
            } else if (btn.classList.contains('reset')) {
                this.resetarEscudo();
            }
        });
        
        // Verifica escudo imediatamente
        setTimeout(() => this.verificarEscudo(), 500);
        
        // Verifica a cada segundo
        setInterval(() => this.verificarEscudo(), 1000);
        
        // Observa mudanças no sistema de equipamentos
        document.addEventListener('equipamentosAtualizados', () => {
            setTimeout(() => this.verificarEscudo(), 300);
        });
    }

    verificarEscudo() {
        if (!window.sistemaEquipamentos) return;
        
        try {
            // Procura escudo equipado
            let escudoEncontrado = null;
            
            // 1. Escudos na lista de escudos equipados
            if (window.sistemaEquipamentos.equipamentosEquipados && 
                window.sistemaEquipamentos.equipamentosEquipados.escudos &&
                window.sistemaEquipamentos.equipamentosEquipados.escudos.length > 0) {
                
                escudoEncontrado = window.sistemaEquipamentos.equipamentosEquipados.escudos[0];
            }
            
            // 2. Se não encontrou, procura em maos (armas/escudos)
            if (!escudoEncontrado && 
                window.sistemaEquipamentos.equipamentosEquipados &&
                window.sistemaEquipamentos.equipamentosEquipados.maos) {
                
                for (const item of window.sistemaEquipamentos.equipamentosEquipados.maos) {
                    if (item.bd !== undefined || (item.rdpv && item.rdpv.includes('RD') || item.rdpv.includes('PV'))) {
                        escudoEncontrado = item;
                        break;
                    }
                }
            }
            
            // 3. Se não encontrou, procura em itens no corpo
            if (!escudoEncontrado && 
                window.sistemaEquipamentos.equipamentosEquipados &&
                window.sistemaEquipamentos.equipamentosEquipados.corpo) {
                
                for (const item of window.sistemaEquipamentos.equipamentosEquipados.corpo) {
                    if (item.bd !== undefined || (item.rdpv && (item.rdpv.includes('RD') || item.rdpv.includes('PV')))) {
                        escudoEncontrado = item;
                        break;
                    }
                }
            }
            
            // Se encontrou um escudo
            if (escudoEncontrado) {
                // Verifica se é um escudo diferente do atual
                if (!this.escudoEquipado || this.escudoEquipado.idUnico !== escudoEncontrado.idUnico) {
                    this.escudoEquipado = escudoEncontrado;
                    this.carregarDadosEscudo(escudoEncontrado);
                    this.atualizarCard();
                }
            } else {
                // Se tinha escudo antes mas agora não tem
                if (this.escudoEquipado) {
                    this.escudoEquipado = null;
                    this.atualizarCardVazio();
                }
            }
            
        } catch (error) {
            console.log('Erro ao verificar escudo:', error);
        }
    }

    carregarDadosEscudo(escudo) {
        // BD (Bônus de Defesa)
        if (escudo.bd) {
            const bdStr = escudo.bd.toString();
            const match = bdStr.match(/\d+/);
            this.BD = match ? parseInt(match[0]) : 0;
        } else {
            this.BD = 0;
        }
        
        // RD/PV
        this.RD = 0;
        this.PVMaximo = 0;
        
        if (escudo.rdpv) {
            const rdpvStr = escudo.rdpv.toString().trim();
            
            // Formato: "5/20" ou "7/40"
            if (rdpvStr.includes('/')) {
                const partes = rdpvStr.split('/');
                this.RD = parseInt(partes[0]) || 0;
                this.PVMaximo = parseInt(partes[1]) || 0;
            }
            // Formato: "RD 5" ou "RD5"
            else if (rdpvStr.toUpperCase().includes('RD')) {
                this.RD = parseInt(rdpvStr.replace(/\D/g, '')) || 0;
            }
            // Formato: "PV 50" ou "PV50"
            else if (rdpvStr.toUpperCase().includes('PV')) {
                this.PVMaximo = parseInt(rdpvStr.replace(/\D/g, '')) || 0;
            }
            // Apenas número
            else {
                const num = parseInt(rdpvStr);
                if (!isNaN(num)) {
                    this.RD = num;
                }
            }
        }
        
        // Carrega PV salvo
        if (escudo.idUnico && this.PVMaximo > 0) {
            const chave = `escudo_${escudo.idUnico}`;
            const salvo = localStorage.getItem(chave);
            this.PVAtual = salvo ? parseInt(salvo) : this.PVMaximo;
        } else {
            this.PVAtual = this.PVMaximo;
        }
    }

    aplicarDano(dano) {
        if (!this.escudoEquipado) return;
        
        let danoFinal = dano;
        
        // Aplica RD se existir
        if (this.RD > 0) {
            danoFinal = Math.max(0, dano - this.RD);
        }
        
        // Se tem PV, reduz
        if (this.PVMaximo > 0) {
            this.PVAtual = Math.max(0, this.PVAtual - danoFinal);
            this.salvarPV();
        }
        
        this.atualizarCard();
    }

    aplicarCura(cura) {
        if (!this.escudoEquipado || this.PVMaximo === 0) return;
        
        this.PVAtual = Math.min(this.PVMaximo, this.PVAtual + cura);
        this.salvarPV();
        this.atualizarCard();
    }

    resetarEscudo() {
        if (!this.escudoEquipado || this.PVMaximo === 0) return;
        
        this.PVAtual = this.PVMaximo;
        this.salvarPV();
        this.atualizarCard();
    }

    salvarPV() {
        if (this.escudoEquipado && this.escudoEquipado.idUnico && this.PVMaximo > 0) {
            localStorage.setItem(`escudo_${this.escudoEquipado.idUnico}`, this.PVAtual.toString());
        }
    }

    atualizarCard() {
        if (!this.escudoEquipado) {
            this.atualizarCardVazio();
            return;
        }

        // Nome
        const nome = document.getElementById('escudoNome');
        if (nome) nome.textContent = this.escudoEquipado.nome;
        
        // DR (mostra BD ou RD, o que for maior)
        const dr = document.getElementById('escudoDR');
        if (dr) {
            const valorDR = Math.max(this.BD, this.RD);
            dr.textContent = valorDR;
        }
        
        // Status
        const status = document.getElementById('escudoStatus');
        if (status) {
            if (this.PVMaximo > 0) {
                if (this.PVAtual > 0) {
                    status.textContent = 'Ativo';
                    status.className = 'status-badge ativo';
                } else {
                    status.textContent = 'Quebrado';
                    status.className = 'status-badge quebrado';
                }
            } else {
                status.textContent = 'Ativo';
                status.className = 'status-badge ativo';
            }
        }
        
        // PV/RD
        const pvTexto = document.getElementById('escudoPVTexto');
        const pvFill = document.getElementById('escudoPVFill');
        
        if (pvTexto && pvFill) {
            if (this.PVMaximo > 0) {
                // Escudo com PV
                const porcentagem = (this.PVAtual / this.PVMaximo) * 100;
                pvTexto.textContent = `${this.PVAtual}/${this.PVMaximo}`;
                pvFill.style.width = `${porcentagem}%`;
                
                // Cor da barra
                if (porcentagem > 50) {
                    pvFill.style.background = '#2ecc71';
                } else if (porcentagem > 25) {
                    pvFill.style.background = '#f39c12';
                } else if (porcentagem > 0) {
                    pvFill.style.background = '#e74c3c';
                } else {
                    pvFill.style.background = '#95a5a6';
                }
            } else {
                // Escudo apenas com RD
                pvTexto.textContent = `RD ${this.RD}`;
                pvFill.style.width = '100%';
                pvFill.style.background = '#3498db';
            }
        }
    }

    atualizarCardVazio() {
        const nome = document.getElementById('escudoNome');
        const dr = document.getElementById('escudoDR');
        const status = document.getElementById('escudoStatus');
        const pvTexto = document.getElementById('escudoPVTexto');
        const pvFill = document.getElementById('escudoPVFill');

        if (nome) nome.textContent = 'Nenhum escudo equipado';
        if (dr) dr.textContent = '0';
        if (status) {
            status.textContent = 'Inativo';
            status.className = 'status-badge inativo';
        }
        if (pvTexto) pvTexto.textContent = '0/0';
        if (pvFill) {
            pvFill.style.width = '0%';
            pvFill.style.background = '#95a5a6';
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Espera a aba de combate estar pronta
    const verificarAbaCombate = () => {
        const cardEscudo = document.querySelector('.escudo-section');
        if (cardEscudo && !window.sistemaEscudo) {
            window.sistemaEscudo = new SistemaEscudo();
        }
    };
    
    verificarAbaCombate();
    
    // Observa quando a aba muda
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'combate' && tab.classList.contains('active')) {
                    setTimeout(verificarAbaCombate, 100);
                }
            }
        });
    });
    
    const abaCombate = document.getElementById('combate');
    if (abaCombate) {
        observer.observe(abaCombate, { attributes: true });
    }
});

// Funções globais para os botões
function danoEscudo(dano) {
    if (window.sistemaEscudo) {
        window.sistemaEscudo.aplicarDano(dano);
    }
}

function curaEscudo(cura) {
    if (window.sistemaEscudo) {
        window.sistemaEscudo.aplicarCura(cura);
    }
}

function resetEscudo() {
    if (window.sistemaEscudo) {
        window.sistemaEscudo.resetarEscudo();
    }
}