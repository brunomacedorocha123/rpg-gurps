// caracteristicas-aparencia.js
// Sistema de Aparência Física para Ficha GURPS

// Dados de aparência com descrições detalhadas
const APARENCIA_DATA = {
    "-24": {
        nome: "Horrendo",
        reacao: "-6",
        descricao: "Sua aparência causa repulsa imediata. Aparência assustadora que causa desconforto e medo.",
        exemplo: "Queimaduras graves, deformações severas, doenças visíveis avançadas."
    },
    "-20": {
        nome: "Monstruoso",
        reacao: "-5",
        descricao: "Aparência claramente não humana ou deformada. Pessoas podem fugir ou atacar por instinto.",
        exemplo: "Mutante extremo, criatura bestial, deformações monstruosas."
    },
    "-16": {
        nome: "Hediondo",
        reacao: "-4",
        descricao: "Extremamente feio e desagradável. Causa forte desconforto e rejeição social.",
        exemplo: "Rosto severamente desfigurado, falta de traços faciais normais."
    },
    "-8": {
        nome: "Feio",
        reacao: "-2",
        descricao: "Claramente abaixo da média. Dificuldade em relacionamentos sociais.",
        exemplo: "Traços desarmônicos, pele muito ruim, características desproporcionais."
    },
    "-4": {
        nome: "Sem Atrativos",
        reacao: "-1",
        descricao: "Abaixo da média, mas não chocante. Não atrai atenção negativa imediata.",
        exemplo: "Traços medianos, aparência comum mas pouco cuidada."
    },
    "0": {
        nome: "Comum",
        reacao: "+0",
        descricao: "Aparência padrão, sem modificadores. A média da população.",
        exemplo: "Aparência normal, típica da maioria das pessoas."
    },
    "4": {
        nome: "Atraente",
        reacao: "+1",
        descricao: "Acima da média. Chama atenção positiva em situações sociais.",
        exemplo: "Traços harmoniosos, bem cuidado, presença agradável."
    },
    "12": {
        nome: "Elegante",
        reacao: "+2",
        descricao: "Muito bonito(a). Destaque em qualquer ambiente social.",
        exemplo: "Beleza notável, presença marcante, charme natural."
    },
    "16": {
        nome: "Muito Elegante",
        reacao: "+4",
        descricao: "Excepcionalmente bonito(a). Pode causar distrações e vantagens sociais significativas.",
        exemplo: "Beleza rara, características perfeitas, magnetismo pessoal."
    },
    "20": {
        nome: "Lindo",
        reacao: "+6",
        descricao: "Beleza deslumbrante. Afeta profundamente interações sociais e percepções.",
        exemplo: "Perfeição estética, beleza lendária, impacto visual impressionante."
    }
};

// Sistema de cores para pontos (positivo/negativo)
const CORES_PONTOS = {
    positivo: "#27ae60", // Verde
    negativo: "#e74c3c", // Vermelho
    neutro: "#95a5a6"    // Cinza
};

class SistemaAparencia {
    constructor() {
        this.selectAparencia = document.getElementById('nivelAparencia');
        this.displayAparencia = document.getElementById('displayAparencia');
        this.badgePontos = document.getElementById('pontosAparencia');
        
        this.inicializar();
    }
    
    inicializar() {
        // Carregar valor salvo se existir
        this.carregarEstadoSalvo();
        
        // Configurar evento de mudança
        this.selectAparencia.addEventListener('change', (e) => {
            this.atualizarAparencia(e.target.value);
            this.salvarEstado();
            this.atualizarPontuacaoTotal();
        });
        
        // Atualizar inicialmente
        this.atualizarAparencia(this.selectAparencia.value);
    }
    
    atualizarAparencia(valor) {
        const dados = APARENCIA_DATA[valor];
        const pontos = parseInt(valor);
        
        // Atualizar display
        this.atualizarDisplay(dados, pontos);
        
        // Atualizar badge de pontos
        this.atualizarBadgePontos(pontos);
        
        // Atualizar no sistema principal se existir
        this.notificarSistemaPrincipal(pontos);
    }
    
    atualizarDisplay(dados, pontos) {
        const html = `
            <div class="display-header">
                <i class="fas ${this.getIconeAparencia(pontos)}"></i>
                <div>
                    <strong>${dados.nome}</strong>
                    <small>Reação: ${dados.reacao}</small>
                </div>
            </div>
            <p class="display-desc">${dados.descricao}</p>
            <div class="display-details">
                <small><i class="fas fa-info-circle"></i> <strong>Exemplo:</strong> ${dados.exemplo}</strong></small>
            </div>
        `;
        
        this.displayAparencia.innerHTML = html;
        
        // Adicionar estilo baseado nos pontos
        this.aplicarEstiloDisplay(pontos);
    }
    
    getIconeAparencia(pontos) {
        if (pontos < 0) return 'fa-user-injured';
        if (pontos === 0) return 'fa-user';
        if (pontos <= 12) return 'fa-user-tie';
        return 'fa-crown';
    }
    
    aplicarEstiloDisplay(pontos) {
        // Remover classes anteriores
        this.displayAparencia.classList.remove('aparencia-positiva', 'aparencia-negativa', 'aparencia-neutra');
        
        // Adicionar classe apropriada
        if (pontos > 0) {
            this.displayAparencia.classList.add('aparencia-positiva');
        } else if (pontos < 0) {
            this.displayAparencia.classList.add('aparencia-negativa');
        } else {
            this.displayAparencia.classList.add('aparencia-neutra');
        }
    }
    
    atualizarBadgePontos(pontos) {
        this.badgePontos.textContent = `${pontos > 0 ? '+' : ''}${pontos} pts`;
        
        // Aplicar cor baseada no valor
        if (pontos > 0) {
            this.badgePontos.style.background = `linear-gradient(145deg, 
                rgba(39, 174, 96, 0.2), 
                rgba(39, 174, 96, 0.3))`;
            this.badgePontos.style.borderColor = '#27ae60';
            this.badgePontos.style.color = '#27ae60';
        } else if (pontos < 0) {
            this.badgePontos.style.background = `linear-gradient(145deg, 
                rgba(231, 76, 60, 0.2), 
                rgba(231, 76, 60, 0.3))`;
            this.badgePontos.style.borderColor = '#e74c3c';
            this.badgePontos.style.color = '#e74c3c';
        } else {
            this.badgePontos.style.background = `linear-gradient(145deg, 
                rgba(212, 175, 55, 0.2), 
                rgba(212, 175, 55, 0.3))`;
            this.badgePontos.style.borderColor = 'var(--primary-gold)';
            this.badgePontos.style.color = 'var(--text-gold)';
        }
    }
    
    notificarSistemaPrincipal(pontos) {
        // Disparar evento customizado para o sistema principal
        const event = new CustomEvent('atualizarPontosAparencia', {
            detail: { pontos }
        });
        document.dispatchEvent(event);
        
        // Se houver um objeto global do sistema
        if (window.sistemaPersonagem) {
            window.sistemaPersonagem.atualizarCaracteristica('aparencia', pontos);
        }
    }
    
    atualizarPontuacaoTotal() {
        // Esta função seria chamada pelo sistema principal
        // para atualizar a pontuação total do personagem
        if (window.atualizarPontuacaoTotal) {
            window.atualizarPontuacaoTotal();
        }
    }
    
    salvarEstado() {
        try {
            const estado = {
                nivelAparencia: this.selectAparencia.value,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('gurpsAparencia', JSON.stringify(estado));
        } catch (e) {
            console.warn('Não foi possível salvar estado da aparência:', e);
        }
    }
    
    carregarEstadoSalvo() {
        try {
            const salvo = localStorage.getItem('gurpsAparencia');
            if (salvo) {
                const estado = JSON.parse(salvo);
                this.selectAparencia.value = estado.nivelAparencia;
                return true;
            }
        } catch (e) {
            console.warn('Não foi possível carregar estado da aparência:', e);
        }
        return false;
    }
    
    // Métodos públicos para integração com outros sistemas
    getPontos() {
        return parseInt(this.selectAparencia.value);
    }
    
    getDescricao() {
        const valor = this.selectAparencia.value;
        return APARENCIA_DATA[valor] || APARENCIA_DATA["0"];
    }
    
    reset() {
        this.selectAparencia.value = "0";
        this.atualizarAparencia("0");
        this.salvarEstado();
    }
}

// Função para adicionar estilos dinâmicos
function adicionarEstilosDinamicos() {
    const style = document.createElement('style');
    style.textContent = `
        /* Estilos dinâmicos para aparência */
        #caracteristicas .aparencia-display.aparencia-positiva {
            border-color: #27ae60;
            background: linear-gradient(145deg, 
                rgba(26, 18, 0, 0.7), 
                rgba(39, 174, 96, 0.1));
        }
        
        #caracteristicas .aparencia-display.aparencia-negativa {
            border-color: #e74c3c;
            background: linear-gradient(145deg, 
                rgba(26, 18, 0, 0.7), 
                rgba(231, 76, 60, 0.1));
        }
        
        #caracteristicas .aparencia-display.aparencia-neutra {
            border-color: var(--wood-light);
            background: rgba(26, 18, 0, 0.6);
        }
        
        #caracteristicas .display-details {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px dashed rgba(212, 175, 55, 0.2);
            font-size: 0.8rem;
            color: var(--wood-light);
        }
        
        #caracteristicas .display-details i {
            color: var(--secondary-gold);
            margin-right: 5px;
        }
        
        /* Animações para mudanças */
        @keyframes updateAparencia {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        
        #caracteristicas .aparencia-display.atualizando {
            animation: updateAparencia 0.3s ease;
        }
        
        /* Destaque para o select */
        #caracteristicas .aparencia-control select:focus {
            box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.3);
        }
    `;
    document.head.appendChild(style);
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na aba correta
    const abaCaracteristicas = document.getElementById('caracteristicas');
    if (!abaCaracteristicas || !abaCaracteristicas.classList.contains('active')) {
        // Se não estiver ativa, esperar pela ativação
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' &&
                    abaCaracteristicas.classList.contains('active')) {
                    
                    initSistemaAparencia();
                    observer.disconnect();
                }
            });
        });
        
        observer.observe(abaCaracteristicas, { 
            attributes: true,
            attributeFilter: ['class']
        });
    } else {
        initSistemaAparencia();
    }
    
    function initSistemaAparencia() {
        // Adicionar estilos dinâmicos
        adicionarEstilosDinamicos();
        
        // Inicializar sistema
        window.sistemaAparencia = new SistemaAparencia();
        
        // Adicionar funcionalidade extra ao display
        const display = document.getElementById('displayAparencia');
        if (display) {
            display.addEventListener('click', function() {
                // Adicionar efeito visual ao clicar
                this.classList.add('atualizando');
                setTimeout(() => {
                    this.classList.remove('atualizando');
                }, 300);
            });
        }
        
        console.log('Sistema de Aparência inicializado');
    }
});

// Exportar para uso em outros módulos (se usando módulos ES6)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SistemaAparencia, APARENCIA_DATA };
}