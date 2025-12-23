// caracteristicas-aparencia.js - CÓDIGO COMPLETO QUE FUNCIONA
console.log('🎭 SISTEMA DE APARÊNCIA - CARREGANDO');

class SistemaAparencia {
    constructor() {
        console.log('✅ SistemaAparencia criado');
        this.inicializado = false;
    }
    
    inicializar() {
        if (this.inicializado) {
            console.log('⚠️ Já estava inicializado');
            return;
        }
        
        console.log('🚀 Inicializando sistema de aparência...');
        
        // 1. PEGAR OS ELEMENTOS DO HTML
        this.select = document.getElementById('nivelAparencia');
        this.badge = document.getElementById('pontosAparencia');
        this.display = document.getElementById('displayAparencia');
        
        console.log('🔍 Procurando elementos:', {
            select: this.select ? '✅' : '❌',
            badge: this.badge ? '✅' : '❌',
            display: this.display ? '✅' : '❌'
        });
        
        // Se não encontrou, tenta de novo em 1 segundo
        if (!this.select || !this.badge || !this.display) {
            console.log('⚠️ Elementos não encontrados, tentando novamente em 1s...');
            setTimeout(() => this.inicializar(), 1000);
            return;
        }
        
        console.log('✅ Todos elementos encontrados!');
        
        // 2. CONFIGURAR O EVENTO DO SELECT
        this.select.addEventListener('change', (event) => {
            const valor = event.target.value;
            console.log(`🔄 Select mudou para: ${valor}`);
            this.atualizarAparencia(valor);
        });
        
        // 3. INICIALIZAR COM O VALOR ATUAL
        const valorInicial = this.select.value;
        console.log(`📊 Valor inicial: ${valorInicial}`);
        this.atualizarAparencia(valorInicial);
        
        this.inicializado = true;
        console.log('🎉 Sistema de aparência INICIALIZADO!');
    }
    
    atualizarAparencia(valor) {
        console.log(`📈 Atualizando aparência com valor: ${valor}`);
        
        // Converter valor para número
        const pontos = parseInt(valor);
        
        // 1. ATUALIZAR O BADGE (os pontos)
        this.atualizarBadge(pontos);
        
        // 2. ATUALIZAR O DISPLAY (nome e descrição)
        this.atualizarDisplay(pontos);
        
        console.log('✅ Aparência atualizada!');
    }
    
    atualizarBadge(pontos) {
        if (!this.badge) return;
        
        console.log(`📛 Atualizando badge com: ${pontos} pontos`);
        
        // Formatar texto: "+4 pts" ou "-8 pts"
        const texto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
        this.badge.textContent = texto;
        
        // Mudar cor baseada nos pontos
        if (pontos > 0) {
            // POSITIVO: Verde
            this.badge.style.backgroundColor = '#2ecc71';
            this.badge.style.color = 'white';
            this.badge.style.borderColor = '#27ae60';
        } else if (pontos < 0) {
            // NEGATIVO: Vermelho
            this.badge.style.backgroundColor = '#e74c3c';
            this.badge.style.color = 'white';
            this.badge.style.borderColor = '#c0392b';
        } else {
            // ZERO: Azul
            this.badge.style.backgroundColor = '#3498db';
            this.badge.style.color = 'white';
            this.badge.style.borderColor = '#2980b9';
        }
        
        console.log(`✅ Badge atualizado: ${texto}`);
    }
    
    atualizarDisplay(pontos) {
        if (!this.display) return;
        
        console.log(`🖥️ Atualizando display com: ${pontos} pontos`);
        
        // Dados baseados nos pontos
        let dados;
        
        switch(pontos) {
            case -24:
                dados = { nome: "Horrendo", reacao: "-6", desc: "Indescritivelmente monstruoso ou repugnante", icone: "fas fa-skull-crossbones", cor: "#8B0000" };
                break;
            case -20:
                dados = { nome: "Monstruoso", reacao: "-5", desc: "Horrível e obviamente anormal", icone: "fas fa-ghost", cor: "#DC143C" };
                break;
            case -16:
                dados = { nome: "Hediondo", reacao: "-4", desc: "Característica repugnante na aparência", icone: "fas fa-meh-rolling-eyes", cor: "#FF4500" };
                break;
            case -8:
                dados = { nome: "Feio", reacao: "-2", desc: "Cabelo seboso, dentes tortos, etc.", icone: "fas fa-meh", cor: "#FF6347" };
                break;
            case -4:
                dados = { nome: "Sem Atrativos", reacao: "-1", desc: "Algo antipático, mas não específico", icone: "fas fa-meh-blank", cor: "#FFA500" };
                break;
            case 0:
                dados = { nome: "Comum", reacao: "+0", desc: "Aparência padrão, sem modificadores", icone: "fas fa-user", cor: "#3498db" };
                break;
            case 4:
                dados = { nome: "Atraente", reacao: "+1", desc: "Boa aparência, +1 em testes de reação", icone: "fas fa-smile", cor: "#2ecc71" };
                break;
            case 12:
                dados = { nome: "Elegante", reacao: "+3", desc: "Poderia entrar em concursos de beleza", icone: "fas fa-grin-stars", cor: "#1abc9c" };
                break;
            case 16:
                dados = { nome: "Muito Elegante", reacao: "+4", desc: "Poderia vencer concursos de beleza", icone: "fas fa-crown", cor: "#9b59b6" };
                break;
            case 20:
                dados = { nome: "Lindo", reacao: "+5", desc: "Espécime ideal, aparência divina", icone: "fas fa-star", cor: "#f1c40f" };
                break;
            default:
                dados = { nome: "Desconhecido", reacao: "+0", desc: "Nível não definido", icone: "fas fa-question", cor: "#95a5a6" };
        }
        
        console.log(`📋 Dados do nível: ${dados.nome}`);
        
        // Atualizar o HTML do display
        this.display.innerHTML = `
            <div class="display-header">
                <i class="${dados.icone}" style="color: ${dados.cor}; font-size: 1.8em;"></i>
                <div>
                    <strong style="color: ${dados.cor}; font-size: 1.2em;">${dados.nome}</strong>
                    <small style="color: ${dados.cor}; margin-left: 10px;">Reação: ${dados.reacao}</small>
                </div>
            </div>
            <p class="display-desc" style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px; border-left: 3px solid ${dados.cor}">
                ${dados.desc}
            </p>
        `;
        
        console.log(`✅ Display atualizado: ${dados.nome}`);
    }
}

// ========================
// INICIALIZAÇÃO AUTOMÁTICA
// ========================

// Criar instância global
window.sistemaAparencia = new SistemaAparencia();

// Quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - Sistema pronto');
});

// Quando clicar na tab "características"
document.addEventListener('click', function(event) {
    const tabBtn = event.target.closest('.tab-btn[data-tab="caracteristicas"]');
    if (tabBtn) {
        console.log('🎯 Clicou na tab características');
        setTimeout(() => {
            if (window.sistemaAparencia) {
                window.sistemaAparencia.inicializar();
            }
        }, 300);
    }
});

// Inicializar automaticamente se já estiver na tab características
setTimeout(function() {
    const tabAtiva = document.querySelector('#caracteristicas.tab-pane.active');
    if (tabAtiva && window.sistemaAparencia) {
        console.log('🔍 Tab características já ativa, inicializando...');
        window.sistemaAparencia.inicializar();
    }
}, 2000);

// Inicialização de segurança após 5 segundos
setTimeout(function() {
    if (window.sistemaAparencia && !window.sistemaAparencia.inicializado) {
        console.log('⏰ Inicialização de segurança após 5s');
        window.sistemaAparencia.inicializar();
    }
}, 5000);

console.log('✅ Sistema de aparência carregado com sucesso!');