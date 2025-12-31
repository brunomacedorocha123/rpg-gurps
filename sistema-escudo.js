// sistema-escudo.js - SISTEMA COMPLETO DE ESCUDO
class SistemaEscudo {
    constructor() {
        this.escudo = null;
        this.BD = 0;
        this.RD = 0;
        this.PV = 0;
        this.PV_MAX = 0;
        this.iniciar();
    }

    iniciar() {
        this.configurarBotoes();
        this.monitorarEquipamentos();
        setTimeout(() => this.verificarEscudo(), 1000);
        setInterval(() => this.verificarEscudo(), 2000);
    }

    configurarBotoes() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-escudo');
            if (!btn) return;
            
            if (btn.classList.contains('dano-5')) this.aplicarDano(5);
            else if (btn.classList.contains('dano-1')) this.aplicarDano(1);
            else if (btn.classList.contains('cura-1')) this.aplicarCura(1);
            else if (btn.classList.contains('cura-5')) this.aplicarCura(5);
            else if (btn.classList.contains('reset')) this.resetar();
        });
    }

    monitorarEquipamentos() {
        document.addEventListener('equipamentosAtualizados', () => {
            setTimeout(() => this.verificarEscudo(), 300);
        });
    }

    verificarEscudo() {
        if (!window.sistemaEquipamentos) return;
        
        try {
            let escudoEncontrado = null;
            
            if (window.sistemaEquipamentos.equipamentosEquipados?.escudos?.length > 0) {
                escudoEncontrado = window.sistemaEquipamentos.equipamentosEquipados.escudos[0];
            }
            
            if (!escudoEncontrado && window.sistemaEquipamentos.equipamentosEquipados?.maos) {
                for (let item of window.sistemaEquipamentos.equipamentosEquipados.maos) {
                    if (item.bd !== undefined || item.rdpv !== undefined) {
                        escudoEncontrado = item;
                        break;
                    }
                }
            }
            
            if (!escudoEncontrado && window.sistemaEquipamentos.equipamentosEquipados?.corpo) {
                for (let item of window.sistemaEquipamentos.equipamentosEquipados.corpo) {
                    if (item.bd !== undefined || item.rdpv !== undefined) {
                        escudoEncontrado = item;
                        break;
                    }
                }
            }
            
            if (!escudoEncontrado && window.sistemaEquipamentos.equipamentosAdquiridos) {
                for (let item of window.sistemaEquipamentos.equipamentosAdquiridos) {
                    if (item.equipado && (item.bd !== undefined || item.rdpv !== undefined)) {
                        escudoEncontrado = item;
                        break;
                    }
                }
            }
            
            if (escudoEncontrado) {
                if (!this.escudo || this.escudo.idUnico !== escudoEncontrado.idUnico) {
                    this.escudo = escudoEncontrado;
                    this.carregarDados();
                    this.atualizarInterface();
                }
            } else {
                if (this.escudo) {
                    this.escudo = null;
                    this.atualizarInterfaceVazia();
                }
            }
        } catch (e) {}
    }

    carregarDados() {
        if (!this.escudo) return;
        
        this.BD = 0;
        if (this.escudo.bd) {
            const match = this.escudo.bd.toString().match(/\d+/);
            this.BD = match ? parseInt(match[0]) : 0;
        }
        
        this.RD = 0;
        this.PV_MAX = 0;
        
        if (this.escudo.rdpv) {
            const str = this.escudo.rdpv.toString();
            
            if (str.includes('/')) {
                const partes = str.split('/');
                this.RD = parseInt(partes[0]) || 0;
                this.PV_MAX = parseInt(partes[1]) || 0;
            }
            else if (str.toLowerCase().includes('rd')) {
                this.RD = parseInt(str.replace(/\D/g, '')) || 0;
            }
            else if (str.toLowerCase().includes('pv')) {
                this.PV_MAX = parseInt(str.replace(/\D/g, '')) || 0;
            }
        }
        
        if (this.escudo.idUnico) {
            const salvo = localStorage.getItem(`escudo_${this.escudo.idUnico}_pv`);
            this.PV = salvo ? parseInt(salvo) : this.PV_MAX;
        } else {
            this.PV = this.PV_MAX;
        }
    }

    aplicarDano(dano) {
        if (!this.escudo) return;
        
        let danoFinal = dano;
        if (this.RD > 0) {
            danoFinal = Math.max(0, dano - this.RD);
        }
        
        if (this.PV_MAX > 0) {
            this.PV = Math.max(0, this.PV - danoFinal);
            this.salvarPV();
        }
        
        this.atualizarInterface();
    }

    aplicarCura(cura) {
        if (!this.escudo || this.PV_MAX === 0) return;
        
        this.PV = Math.min(this.PV_MAX, this.PV + cura);
        this.salvarPV();
        this.atualizarInterface();
    }

    resetar() {
        if (!this.escudo || this.PV_MAX === 0) return;
        
        this.PV = this.PV_MAX;
        this.salvarPV();
        this.atualizarInterface();
    }

    salvarPV() {
        if (this.escudo && this.escudo.idUnico && this.PV_MAX > 0) {
            localStorage.setItem(`escudo_${this.escudo.idUnico}_pv`, this.PV.toString());
        }
    }

    atualizarInterface() {
        const nome = document.getElementById('escudoNome');
        const dr = document.getElementById('escudoDR');
        const status = document.getElementById('escudoStatus');
        const pvTexto = document.getElementById('escudoPVTexto');
        const pvFill = document.getElementById('escudoPVFill');
        
        if (!nome || !dr || !status || !pvTexto || !pvFill) return;
        
        if (this.escudo) {
            nome.textContent = this.escudo.nome;
            dr.textContent = Math.max(this.BD, this.RD);
            
            if (this.PV_MAX > 0) {
                if (this.PV > 0) {
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
            
            if (this.PV_MAX > 0) {
                const porcentagem = (this.PV / this.PV_MAX) * 100;
                pvTexto.textContent = `${this.PV}/${this.PV_MAX}`;
                pvFill.style.width = `${porcentagem}%`;
                
                if (porcentagem > 50) pvFill.style.background = '#27ae60';
                else if (porcentagem > 25) pvFill.style.background = '#f39c12';
                else if (porcentagem > 0) pvFill.style.background = '#e74c3c';
                else pvFill.style.background = '#7f8c8d';
            } else {
                pvTexto.textContent = `RD ${this.RD}`;
                pvFill.style.width = '100%';
                pvFill.style.background = '#3498db';
            }
        }
    }

    atualizarInterfaceVazia() {
        const nome = document.getElementById('escudoNome');
        const dr = document.getElementById('escudoDR');
        const status = document.getElementById('escudoStatus');
        const pvTexto = document.getElementById('escudoPVTexto');
        const pvFill = document.getElementById('escudoPVFill');
        
        if (!nome || !dr || !status || !pvTexto || !pvFill) return;
        
        nome.textContent = 'Nenhum escudo equipado';
        dr.textContent = '0';
        status.textContent = 'Inativo';
        status.className = 'status-badge inativo';
        pvTexto.textContent = '0/0';
        pvFill.style.width = '0%';
        pvFill.style.background = '#95a5a6';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const verificar = () => {
        const card = document.querySelector('.escudo-section');
        if (card && !window.sistemaEscudo) {
            window.sistemaEscudo = new SistemaEscudo();
        }
    };
    
    verificar();
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'combate' && tab.classList.contains('active')) {
                    setTimeout(verificar, 100);
                }
            }
        });
    });
    
    const aba = document.getElementById('combate');
    if (aba) observer.observe(aba, { attributes: true });
    
    const ativa = document.querySelector('#combate.active');
    if (ativa) setTimeout(verificar, 300);
});

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
    if (window.sistemaEscudo && window.sistemaEscudo.resetar) {
        window.sistemaEscudo.resetar();
    }
};