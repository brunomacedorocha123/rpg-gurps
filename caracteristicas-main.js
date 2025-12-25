// ===========================================
// CARACTERÍSTICAS-MAIN.JS
// Sistema principal para gerenciar características
// ===========================================

class SistemaCaracteristicas {
    constructor() {
        this.sistemas = {
            aparencia: null,
            riqueza: null,
            idiomas: null
        };
        
        this.pontosTotais = 0;
        this.inicializado = false;
    }
    
    inicializar() {
        if (this.inicializado) return;
        
        // Inicializar todos os sistemas
        this.sistemas.aparencia = inicializarSistemaAparencia();
        this.sistemas.riqueza = inicializarSistemaRiqueza();
        this.sistemas.idiomas = inicializarSistemaIdiomas();
        
        // Configurar listeners para atualizações
        document.addEventListener('caracteristicasAtualizadas', (e) => {
            this.calcularPontosTotais();
        });
        
        this.inicializado = true;
        this.calcularPontosTotais();
    }
    
    calcularPontosTotais() {
        let total = 0;
        
        if (this.sistemas.aparencia) {
            total += this.sistemas.aparencia.getPontosAparencia();
        }
        
        if (this.sistemas.riqueza) {
            total += this.sistemas.riqueza.getPontosRiqueza();
        }
        
        if (this.sistemas.idiomas) {
            total += this.sistemas.idiomas.calcularPontosIdiomas();
        }
        
        this.pontosTotais = total;
        
        // Disparar evento
        const evento = new CustomEvent('caracteristicasPontosTotais', {
            detail: {
                total: total,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(evento);
        
        return total;
    }
    
    exportarDados() {
        const dados = {};
        
        if (this.sistemas.aparencia) {
            Object.assign(dados, this.sistemas.aparencia.exportarDados());
        }
        
        if (this.sistemas.riqueza) {
            Object.assign(dados, this.sistemas.riqueza.exportarDados());
        }
        
        if (this.sistemas.idiomas) {
            Object.assign(dados, this.sistemas.idiomas.exportarDados());
        }
        
        dados.pontosTotais = this.pontosTotais;
        return dados;
    }
    
    carregarDados(dados) {
        let carregado = false;
        
        if (dados.aparencia && this.sistemas.aparencia) {
            carregado = this.sistemas.aparencia.carregarDados(dados) || carregado;
        }
        
        if (dados.riqueza && this.sistemas.riqueza) {
            carregado = this.sistemas.riqueza.carregarDados(dados) || carregado;
        }
        
        if (dados.idiomas && this.sistemas.idiomas) {
            carregado = this.sistemas.idiomas.carregarDados(dados) || carregado;
        }
        
        if (carregado) {
            this.calcularPontosTotais();
        }
        
        return carregado;
    }
    
    getPontosTotais() {
        return this.pontosTotais;
    }
    
    validarTudo() {
        const validacoes = [];
        
        if (this.sistemas.aparencia) {
            validacoes.push(this.sistemas.aparencia.exportarDados().aparencia);
        }
        
        if (this.sistemas.riqueza) {
            validacoes.push(this.sistemas.riqueza.exportarDados().riqueza);
        }
        
        if (this.sistemas.idiomas) {
            validacoes.push(this.sistemas.idiomas.validarIdiomas());
        }
        
        return {
            valido: true,
            totalPontos: this.pontosTotais,
            componentes: validacoes,
            resumo: `Total características: ${this.pontosTotais >= 0 ? '+' : ''}${this.pontosTotais} pts`
        };
    }
}

// INICIALIZAÇÃO GLOBAL
let sistemaCaracteristicas = null;

function inicializarSistemaCaracteristicas() {
    if (!sistemaCaracteristicas) {
        sistemaCaracteristicas = new SistemaCaracteristicas();
    }
    sistemaCaracteristicas.inicializar();
    return sistemaCaracteristicas;
}

// INICIALIZAR QUANDO A ABA FOR CARREGADA
document.addEventListener('DOMContentLoaded', function() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'caracteristicas' && tab.classList.contains('active')) {
                    setTimeout(inicializarSistemaCaracteristicas, 200);
                }
            }
        });
    });

    const tabCaracteristicas = document.getElementById('caracteristicas');
    if (tabCaracteristicas) {
        observer.observe(tabCaracteristicas, { attributes: true });
    }
});

// EXPORTAR PARA USO GLOBAL
window.SistemaCaracteristicas = SistemaCaracteristicas;
window.inicializarSistemaCaracteristicas = inicializarSistemaCaracteristicas;
window.sistemaCaracteristicas = sistemaCaracteristicas;